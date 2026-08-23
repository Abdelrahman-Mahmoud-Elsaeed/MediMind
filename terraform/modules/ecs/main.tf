# ==============================================================================
# 1. SECURITY GROUPS FOR ECS TASKS
# ==============================================================================

# Security Group for Fargate Tasks (Allows traffic from ALB & Inter-container traffic)
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  description = "Allows traffic from ALB and internal microservices into ECS task containers"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  ingress {
    from_port = 27017
    to_port   = 27017
    protocol  = "tcp"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    ignore_changes = [description]
  }
}

# ==============================================================================
# 2. ECS CLUSTER & CLOUDWATCH LOG GROUPS
# ==============================================================================

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.project_name}-${var.environment}/frontend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-${var.environment}/backend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/ecs/${var.project_name}-${var.environment}/worker"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "mongodb" {
  name              = "/ecs/${var.project_name}-${var.environment}/mongodb"
  retention_in_days = 7
}

# ==============================================================================
# 3. CLOUD MAP SERVICE DISCOVERY (Private DNS)
# ==============================================================================

resource "aws_service_discovery_private_dns_namespace" "ecs" {
  name        = "${var.project_name}.local"
  description = "ECS Microservices Private DNS Namespace"
  vpc         = var.vpc_id
}

resource "aws_service_discovery_service" "mongodb" {
  name = "mongodb"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.ecs.id

    dns_records {
      ttl  = 10
      type = "A"
    }
    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

# ==============================================================================
# 4. TASK DEFINITIONS & SECRETS MANAGER INJECTION
# ==============================================================================

# --- Task 0: MongoDB Container Service ---
resource "aws_ecs_task_definition" "mongodb" {
  family                   = "${var.project_name}-${var.environment}-mongodb-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = var.ecs_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode([
    {
      name       = "mongodb"
      image      = "mongo:6.0"
      essential  = true
      entryPoint = ["sh", "-c"]
      command    = ["mongod --replSet rs0 --bind_ip_all & MONGOD_PID=$!; sleep 3; mongosh --eval 'try { rs.status() } catch(e) { rs.initiate() }'; wait $MONGOD_PID"]
      portMappings = [
        {
          containerPort = 27017
          hostPort      = 27017
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.mongodb.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "mongodb"
        }
      }
    }
  ])
}

# --- Task 1: Frontend Service ---
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-${var.environment}-frontend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = var.ecs_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = var.frontend_container_image
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3000" }
      ]
      secrets = [
        { name = "NEXT_PUBLIC_API_URL", valueFrom = "${var.app_secrets_arn}:NEXT_PUBLIC_API_URL::" }
      ]
    }
  ])
}

# --- Task 2: Backend Express API Service ---
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = var.ecs_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = var.backend_container_image
      essential = true
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "8080" }
      ]
      secrets = [
        { name = "MONGO_URI", valueFrom = "${var.app_secrets_arn}:MONGO_URI::" },
        { name = "REDIS_URL", valueFrom = "${var.app_secrets_arn}:REDIS_URL::" },
        { name = "JWT_ACCESS_SECRET", valueFrom = "${var.app_secrets_arn}:JWT_ACCESS_SECRET::" },
        { name = "JWT_REFRESH_SECRET", valueFrom = "${var.app_secrets_arn}:JWT_REFRESH_SECRET::" },
        { name = "COOKIE_SECRET", valueFrom = "${var.app_secrets_arn}:COOKIE_SECRET::" },
        { name = "WORKER_SECRET", valueFrom = "${var.app_secrets_arn}:WORKER_SECRET::" },
        { name = "ENCRYPTION_KEY_AES256", valueFrom = "${var.app_secrets_arn}:ENCRYPTION_KEY_AES256::" },
        { name = "FRONTEND_URL", valueFrom = "${var.app_secrets_arn}:FRONTEND_URL::" },
        { name = "WORKER_URL", valueFrom = "${var.app_secrets_arn}:WORKER_URL::" },
        { name = "AWS_S3_BUCKET_NAME", valueFrom = "${var.app_secrets_arn}:S3_BUCKET_NAME::" },
        { name = "S3_BUCKET_NAME", valueFrom = "${var.app_secrets_arn}:S3_BUCKET_NAME::" },
        { name = "AWS_REGION", valueFrom = "${var.app_secrets_arn}:AWS_REGION::" },
        { name = "SNS_TOPIC_ARN", valueFrom = "${var.app_secrets_arn}:SNS_TOPIC_ARN::" },
        { name = "SQS_QUEUE_ID", valueFrom = "${var.app_secrets_arn}:SQS_QUEUE_ID::" }
      ]
    }
  ])
}

# --- Task 3: Worker Background Service ---
resource "aws_ecs_task_definition" "worker" {
  family                   = "${var.project_name}-${var.environment}-worker-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = var.ecs_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode([
    {
      name      = "worker"
      image     = var.worker_container_image
      essential = true
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.worker.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "worker"
        }
      }
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "8080" }
      ]
      secrets = [
        { name = "MONGO_URI", valueFrom = "${var.app_secrets_arn}:MONGO_URI::" },
        { name = "REDIS_URL", valueFrom = "${var.app_secrets_arn}:REDIS_URL::" },
        { name = "WORKER_SECRET", valueFrom = "${var.app_secrets_arn}:WORKER_SECRET::" },
        { name = "BACKEND_API_URL", valueFrom = "${var.app_secrets_arn}:NEXT_PUBLIC_API_URL::" }
      ]
    }
  ])
}

# ==============================================================================
# 5. ECS SERVICES (FARGATE)
# ==============================================================================

# Service 0: MongoDB Container Service
resource "aws_ecs_service" "mongodb" {
  name                               = "${var.project_name}-${var.environment}-mongodb-service"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.mongodb.arn
  desired_count                      = 1
  launch_type                        = "FARGATE"
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.mongodb.arn
  }

  enable_execute_command = true

  depends_on = [aws_ecs_cluster.main]
}

# Service 1: Frontend Service
resource "aws_ecs_service" "frontend" {
  name                               = "${var.project_name}-${var.environment}-frontend-service"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.frontend.arn
  desired_count                      = 2
  launch_type                        = "FARGATE"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.frontend_target_group_arn
    container_name   = "frontend"
    container_port   = 3000
  }

  enable_execute_command = true

  depends_on = [aws_ecs_cluster.main]
}

# Service 2: Backend Service
resource "aws_ecs_service" "backend" {
  name                               = "${var.project_name}-${var.environment}-backend-service"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.backend.arn
  desired_count                      = 2
  launch_type                        = "FARGATE"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "backend"
    container_port   = 8080
  }

  enable_execute_command = true

  depends_on = [aws_ecs_cluster.main]
}

# Service 3: Worker Service
resource "aws_ecs_service" "worker" {
  name                               = "${var.project_name}-${var.environment}-worker-service"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.worker.arn
  desired_count                      = 2
  launch_type                        = "FARGATE"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.worker_target_group_arn
    container_name   = "worker"
    container_port   = 8080
  }

  enable_execute_command = true

  depends_on = [aws_ecs_cluster.main]
}
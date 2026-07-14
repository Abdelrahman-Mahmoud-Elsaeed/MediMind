resource "aws_docdb_subnet_group" "db_subnet" {
  name       = "${var.project_name}-${var.environment}-docdb-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "docdb_sg" {
  name        = "${var.project_name}-${var.environment}-docdb-sg"
  description = "Allow MongoDB traffic inside VPC"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_docdb_cluster" "mongodb" {
  cluster_identifier      = "${var.project_name}-${var.environment}-mongodb"
  engine                  = "docdb"
  master_username         = var.docdb_master_username
  master_password         = var.docdb_master_password
  backup_retention_period = 5
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot     = true
  db_subnet_group_name    = aws_docdb_subnet_group.db_subnet.name
  vpc_security_group_ids  = [aws_security_group.docdb_sg.id]
}

resource "aws_docdb_cluster_instance" "cluster_instances" {
  count              = 1
  identifier         = "${var.project_name}-${var.environment}-mongodb-instance"
  cluster_identifier = aws_docdb_cluster.mongodb.id
  instance_class     = "db.t3.medium"
}
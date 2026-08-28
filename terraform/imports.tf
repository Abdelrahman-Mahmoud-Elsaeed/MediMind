# ==============================================================================
# Declarative Imports for Existing AWS Infrastructure
# ==============================================================================
# Resolves 409 EntityAlreadyExists errors by importing pre-existing AWS IAM roles
# into the remote Terraform S3 state backend.

import {
  to = module.security.aws_iam_role.ecs_execution_role
  id = "medtrack-development-execution-role"
}

import {
  to = module.security.aws_iam_role.ecs_task_role
  id = "medtrack-development-task-role"
}

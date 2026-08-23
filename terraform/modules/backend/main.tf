data "aws_caller_identity" "current" {}

# S3 Bucket for Storing Terraform State Files
resource "aws_s3_bucket" "terraform_state" {
  bucket        = "${var.project_name}-${var.environment}-tfstate-${data.aws_caller_identity.current.account_id}"
  force_destroy = false
}

# Enable S3 Bucket Versioning for State File History & Recovery
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Enable Server-Side Encryption (AES256) for State Bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block Public Access to Terraform State Bucket
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

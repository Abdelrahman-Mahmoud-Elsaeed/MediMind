resource "aws_s3_bucket" "images" {
  bucket        = "${var.project_name}-${var.environment}-packaging-images"
  force_destroy = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-images"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "images_public_block" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
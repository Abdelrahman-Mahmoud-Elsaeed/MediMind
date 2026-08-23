# ==============================================================================
# Terraform S3 Remote State Backend Configuration (Native S3 Lockfile Enabled)
# ==============================================================================
# Stores terraform.tfstate remotely in S3 with versioning, server-side encryption,
# and native S3 lockfile support (`use_lockfile = true`), eliminating DynamoDB.

terraform {
  backend "s3" {
    bucket       = "medtrack-development-tfstate-468997136367"
    key          = "medimind/development/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}

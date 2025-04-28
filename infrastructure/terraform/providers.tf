# Terraform provider configuration

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Configure backend for state management (e.g., S3)
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket-name"
  #   key            = "chainocracy/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "your-terraform-lock-table"
  # }
}

provider "aws" {
  region = var.aws_region
  # Assume credentials are configured via environment variables, IAM role, or shared credentials file
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

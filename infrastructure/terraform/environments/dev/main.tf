# Terraform main configuration for the dev environment

provider "aws" {
  region = var.aws_region
}

# Data source to get AWS Account ID
data "aws_caller_identity" "current" {}

# --- Networking --- #
# Create a new VPC or use an existing one
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "${var.environment_name}-chainocracy-vpc"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 2 # Create two public subnets in different AZs
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.environment_name}-chainocracy-public-subnet-${count.index}"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.environment_name}-chainocracy-igw"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name        = "${var.environment_name}-chainocracy-public-rt"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Associate Public Subnets with Public Route Table
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Get available Availability Zones
data "aws_availability_zones" "available" {}

# --- Backend Module --- #
module "backend" {
  source = "../../modules/backend"

  environment_name = var.environment_name

  vpc_id           = aws_vpc.main.id
  subnet_ids       = aws_subnet.public[*].id
  backend_port     = var.backend_port
  # Construct ECR image URI
  docker_image_uri = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.environment_name}/chainocracy-backend:${var.backend_docker_image_tag}"

  # Pass other backend variables if needed
}

# --- Frontend Web Module --- #
module "frontend_web" {
  source = "../../modules/frontend_web"

  environment_name = var.environment_name
  domain_name      = var.frontend_domain_name
  certificate_arn  = var.frontend_certificate_arn
  backend_api_url  = module.backend.alb_dns_name # Assuming backend module outputs ALB DNS name

  # Pass other frontend variables if needed
}

# --- Outputs --- #
output "backend_alb_dns_name" {
  description = "DNS name of the backend Application Load Balancer"
  value       = module.backend.alb_dns_name
}

output "backend_ecr_repository_url" {
  description = "URL of the backend ECR repository"
  value       = module.backend.ecr_repository_url
}

output "frontend_website_url" {
  description = "URL of the deployed web frontend"
  value       = module.frontend_web.website_url
}

output "frontend_s3_bucket_id" {
  description = "ID of the S3 bucket for the frontend static files"
  value       = module.frontend_web.s3_bucket_id
}

output "frontend_cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution for the frontend"
  value       = module.frontend_web.cloudfront_distribution_id
}


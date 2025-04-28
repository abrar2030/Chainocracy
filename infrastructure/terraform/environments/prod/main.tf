# Terraform main configuration for the prod environment

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
  count                   = 3 # Create three public subnets in different AZs for high availability
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.environment_name}-chainocracy-public-subnet-${count.index}"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 3 # Create three private subnets in different AZs for high availability
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 3)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "${var.environment_name}-chainocracy-private-subnet-${count.index}"
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

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count = 3
  domain = "vpc"

  tags = {
    Name        = "${var.environment_name}-chainocracy-nat-eip-${count.index}"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# NAT Gateways
resource "aws_nat_gateway" "nat" {
  count         = 3
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name        = "${var.environment_name}-chainocracy-nat-${count.index}"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }

  depends_on = [aws_internet_gateway.gw]
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

# Private Route Tables
resource "aws_route_table" "private" {
  count  = 3
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat[count.index].id
  }

  tags = {
    Name        = "${var.environment_name}-chainocracy-private-rt-${count.index}"
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

# Associate Private Subnets with Private Route Tables
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Get available Availability Zones
data "aws_availability_zones" "available" {}

# --- Backend Module --- #
module "backend" {
  source = "../../modules/backend"

  environment_name = var.environment_name
  vpc_id           = aws_vpc.main.id
  subnet_ids       = aws_subnet.private[*].id  # Use private subnets for production
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

# --- Route 53 DNS Records --- #
# Assuming you have a hosted zone for your domain
data "aws_route53_zone" "main" {
  count = var.frontend_domain_name != "" ? 1 : 0
  name  = join(".", slice(split(".", var.frontend_domain_name), 1, length(split(".", var.frontend_domain_name))))
}

resource "aws_route53_record" "frontend" {
  count   = var.frontend_domain_name != "" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = var.frontend_domain_name
  type    = "A"

  alias {
    name                   = module.frontend_web.cloudfront_distribution_domain_name
    zone_id                = "Z2FDTNDATAQYW2" # CloudFront's hosted zone ID is always this value
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "backend" {
  count   = var.frontend_domain_name != "" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = "api.${var.frontend_domain_name}"
  type    = "A"

  alias {
    name                   = module.backend.alb_dns_name
    zone_id                = module.backend.alb_zone_id
    evaluate_target_health = true
  }
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

output "api_domain" {
  description = "Domain name for the API (if custom domain is configured)"
  value       = var.frontend_domain_name != "" ? "api.${var.frontend_domain_name}" : module.backend.alb_dns_name
}

# Terraform variables for the dev environment

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment_name" {
  description = "Name of the deployment environment"
  type        = string
  default     = "dev"
}

variable "backend_instance_type" {
  description = "EC2 instance type for the backend API (if using EC2)"
  type        = string
  default     = "t3.micro"
}

variable "backend_ami_id" {
  description = "AMI ID for the backend EC2 instance (if using EC2)"
  type        = string
  default     = "ami-0c55b159cbfafe1f0" # Example: Amazon Linux 2 AMI (HVM), SSD Volume Type in us-east-1
}

variable "backend_port" {
  description = "Port the backend application listens on"
  type        = number
  default     = 3000
}

variable "frontend_domain_name" {
  description = "Domain name for the web frontend (e.g., chainocracy-dev.example.com)"
  type        = string
  default     = "" # Set a domain name if you have one configured
}

variable "frontend_certificate_arn" {
  description = "ARN of the ACM certificate for the frontend domain (required if frontend_domain_name is set)"
  type        = string
  default     = "" # Provide ACM certificate ARN if using a custom domain
}

variable "backend_docker_image_tag" {
  description = "Tag for the backend Docker image in ECR (e.g., latest, v1.0.0)"
  type        = string
  default     = "latest"
}


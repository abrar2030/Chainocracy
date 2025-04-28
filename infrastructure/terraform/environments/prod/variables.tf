# Terraform variables for the prod environment

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment_name" {
  description = "Name of the deployment environment"
  type        = string
  default     = "prod"
}

variable "backend_instance_type" {
  description = "EC2 instance type for the backend API (if using EC2)"
  type        = string
  default     = "t3.medium" # Larger instance for prod
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
  description = "Domain name for the web frontend (e.g., chainocracy.example.com)"
  type        = string
  default     = "" # REQUIRED: Set the production domain name here
}

variable "frontend_certificate_arn" {
  description = "ARN of the ACM certificate for the frontend domain (required if frontend_domain_name is set)"
  type        = string
  default     = "" # REQUIRED: Provide ACM certificate ARN for the production domain
}

variable "backend_docker_image_tag" {
  description = "Tag for the backend Docker image in ECR (e.g., latest, v1.0.0)"
  type        = string
  default     = "latest" # Consider using specific version tags for prod
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks for ECS service"
  type        = number
  default     = 3 # Higher count for prod
}

variable "backend_cpu" {
  description = "CPU units for backend ECS task"
  type        = string
  default     = "1024" # More CPU for prod
}

variable "backend_memory" {
  description = "Memory (MiB) for backend ECS task"
  type        = string
  default     = "2048" # More Memory for prod
}


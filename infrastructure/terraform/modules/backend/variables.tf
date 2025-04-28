# Terraform variables for the backend module

variable "instance_type" {
  description = "EC2 instance type for the backend API"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID for the backend EC2 instance (Amazon Linux 2 recommended)"
  type        = string
  default     = "ami-0c55b159cbfafe1f0" # Example: Amazon Linux 2 AMI (HVM), SSD Volume Type in us-east-1
}

variable "backend_port" {
  description = "Port the backend application listens on"
  type        = number
  default     = 3000
}

variable "vpc_id" {
  description = "VPC ID for deployment"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for deployment"
  type        = list(string)
}

variable "environment_name" {
  description = "Name of the deployment environment (e.g., dev, prod)"
  type        = string
}

variable "docker_image_uri" {
  description = "URI of the backend Docker image in ECR"
  type        = string
}


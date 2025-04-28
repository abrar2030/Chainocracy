# Terraform variables for the web frontend module

variable "domain_name" {
  description = "Domain name for the web frontend (e.g., chainocracy-dev.example.com)"
  type        = string
  default     = ""
}

variable "environment_name" {
  description = "Name of the deployment environment (e.g., dev, prod)"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS (required if domain_name is set)"
  type        = string
  default     = ""
}

variable "backend_api_url" {
  description = "URL of the backend API for the frontend to connect to"
  type        = string
}

# Add other variables as needed, e.g., for WAF, logging configuration, etc.


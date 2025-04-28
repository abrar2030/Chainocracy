# Terraform outputs for the backend module

output "security_group_id" {
  description = "ID of the backend security group"
  value       = aws_security_group.backend_sg.id
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.backend_ecr.repository_url
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.backend_alb.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer for Route 53 alias records"
  value       = aws_lb.backend_alb.zone_id
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.backend_cluster.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.backend_service.name
}

output "log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.backend_logs.name
}


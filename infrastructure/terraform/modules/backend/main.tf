# Terraform main configuration for the backend module

# ECS Cluster for running the backend API
resource "aws_ecs_cluster" "backend_cluster" {
  name = "${var.environment_name}-chainocracy-backend-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.environment_name}-chainocracy-backend-cluster"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Security Group for the backend service
resource "aws_security_group" "backend_sg" {
  name        = "${var.environment_name}-backend-sg"
  description = "Allow traffic to backend service"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = var.backend_port
    to_port     = var.backend_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # In production, restrict this to CloudFront IPs or VPC CIDR
  }

  ingress {
    from_port   = 22 # SSH
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # In production, restrict this to your IP or bastion host
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment_name}-backend-sg"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# ECR Repository for the backend Docker image
resource "aws_ecr_repository" "backend_ecr" {
  name                 = "${var.environment_name}/chainocracy-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.environment_name}-chainocracy-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Attach the Amazon ECS Task Execution Role policy to the task execution role
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Definition for the backend service
resource "aws_ecs_task_definition" "backend_task" {
  family                   = "${var.environment_name}-chainocracy-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "chainocracy-backend"
      image     = var.docker_image_uri
      essential = true
      portMappings = [
        {
          containerPort = var.backend_port
          hostPort      = var.backend_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_PORT"
          value = tostring(var.backend_port)
        },
        {
          name  = "SERVER_PORT"
          value = "3002"
        },
        {
          name  = "ENVIRONMENT"
          value = var.environment_name
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.environment_name}-chainocracy-backend"
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# CloudWatch Log Group for the backend service
resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/ecs/${var.environment_name}-chainocracy-backend"
  retention_in_days = 30

  tags = {
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Application Load Balancer for the backend service
resource "aws_lb" "backend_alb" {
  name               = "${var.environment_name}-backend-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.backend_sg.id]
  subnets            = var.subnet_ids

  enable_deletion_protection = false # Set to true for production

  tags = {
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# ALB Target Group
resource "aws_lb_target_group" "backend_tg" {
  name        = "${var.environment_name}-backend-tg"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    interval            = 30
    path                = "/health"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    protocol            = "HTTP"
    matcher             = "200"
  }

  tags = {
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# ALB Listener
resource "aws_lb_listener" "backend_listener" {
  load_balancer_arn = aws_lb.backend_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }

  # For production, use HTTPS with ACM certificate
  # port              = 443
  # protocol          = "HTTPS"
  # ssl_policy        = "ELBSecurityPolicy-2016-08"
  # certificate_arn   = var.certificate_arn
}

# ECS Service
resource "aws_ecs_service" "backend_service" {
  name            = "${var.environment_name}-chainocracy-backend-service"
  cluster         = aws_ecs_cluster.backend_cluster.id
  task_definition = aws_ecs_task_definition.backend_task.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.backend_sg.id]
    assign_public_ip = true # Set to false for production with proper VPC setup
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend_tg.arn
    container_name   = "chainocracy-backend"
    container_port   = var.backend_port
  }

  depends_on = [aws_lb_listener.backend_listener]

  tags = {
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Get current AWS region
data "aws_region" "current" {}

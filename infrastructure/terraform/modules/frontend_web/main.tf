# Terraform main configuration for the web frontend module

# S3 bucket for storing static website files
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "${var.environment_name}-chainocracy-frontend-bucket"

  tags = {
    Name        = "${var.environment_name}-chainocracy-frontend-bucket"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# S3 bucket policy to allow public read access (for CloudFront)
resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
        # Condition to restrict access only via CloudFront OAI can be added here for better security
      },
    ]
  })
}

# S3 bucket website configuration (optional, CloudFront is preferred)
# resource "aws_s3_bucket_website_configuration" "frontend_website" {
#   bucket = aws_s3_bucket.frontend_bucket.id

#   index_document {
#     suffix = "index.html"
#   }

#   error_document {
#     key = "index.html" # SPA redirect
#   }
# }

# CloudFront Origin Access Identity (OAI) for restricting S3 access
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.environment_name}-chainocracy-frontend-bucket"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.environment_name} Chainocracy Frontend Distribution"
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend_bucket.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend_bucket.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    # Use ACM certificate if domain name is provided
    acm_certificate_arn      = var.domain_name != "" ? var.certificate_arn : null
    ssl_support_method       = var.domain_name != "" ? "sni-only" : null
    minimum_protocol_version = "TLSv1.2_2021"
    # Use default CloudFront certificate if no domain name
    cloudfront_default_certificate = var.domain_name == "" ? true : false
  }

  aliases = var.domain_name != "" ? [var.domain_name] : []

  tags = {
    Name        = "${var.environment_name}-chainocracy-frontend-cf"
    Environment = var.environment_name
    Project     = "Chainocracy"
  }
}

# Note: Route 53 record creation for the custom domain is typically handled
# in the environment-specific configuration or a dedicated DNS module.


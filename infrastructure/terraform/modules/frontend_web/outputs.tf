# Terraform outputs for the web frontend module

output "s3_bucket_id" {
  description = "ID of the S3 bucket for the frontend static files"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "s3_bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend_distribution.id
}

output "cloudfront_distribution_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend_distribution.domain_name
}

output "website_url" {
  description = "URL of the deployed web frontend"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.frontend_distribution.domain_name}"
}


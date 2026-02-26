
# Root Outputs - Networking#


output "networking9" {
  description = "All important networking outputs for the Terraform isolated env (suffix 9)"

  value = {
    vpc_id             = module.networking.vpc_id
    public_subnet_ids  = module.networking.public_subnet_ids
    private_subnet_ids = module.networking.private_subnet_ids
    lambda_sg_id       = module.networking.lambda_sg_id
    endpoint_sg_id     = module.networking.endpoint_sg_id
    nat_gateway_ids    = module.networking.nat_gateway_ids
  }
}


# Individual Outputs


# VPC
output "vpc_id9" {
  description = "VPC ID (suffix 9 environment)"
  value       = module.networking.vpc_id
}

# Public subnets
output "public_subnet_ids9" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnet_ids
}

# Private subnets
output "private_subnet_ids9" {
  description = "Private subnet IDs"
  value       = module.networking.private_subnet_ids
}

# Lambda Security Group
output "lambda_sg_id9" {
  description = "Lambda security group ID"
  value       = module.networking.lambda_sg_id
}

# Endpoint Security Group
output "endpoint_sg_id9" {
  description = "VPC endpoint security group ID"
  value       = module.networking.endpoint_sg_id
}

# NAT Gateways
output "nat_gateway_ids9" {
  description = "NAT Gateway IDs"
  value       = module.networking.nat_gateway_ids
}

# Root Outputs - Frontend (S3 + CloudFront) #

output "frontend9" {
  description = "Frontend hosting outputs (suffix 9)"
  value = {
    frontend_bucket_name       = module.s3_cloudfront.frontend_bucket_name
    cloudfront_distribution_id = module.s3_cloudfront.cloudfront_distribution_id
    cloudfront_domain_name     = module.s3_cloudfront.cloudfront_domain_name
  }
}

# Optional individual outputs
output "frontend_bucket_name9" {
  value       = module.s3_cloudfront.frontend_bucket_name
  description = "Frontend S3 bucket name"
}

output "cloudfront_distribution_id9" {
  value       = module.s3_cloudfront.cloudfront_distribution_id
  description = "CloudFront distribution ID"
}

output "cloudfront_domain_name9" {
  value       = module.s3_cloudfront.cloudfront_domain_name
  description = "CloudFront domain name"
}
output "dynamodb9" {
  value = module.dynamodb.dynamodb9
}
output "cognito9" {
  value = module.cognito.cognito9
}

output "user_pool_id9" {
  value = module.cognito.user_pool_id9
}

output "web_client_id9" {
  value = module.cognito.web_client_id9
}
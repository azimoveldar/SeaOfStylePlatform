variable "project" {
  type    = string
  default = "sos"
}

variable "region" {
  type    = string
  default = "ca-central-1"
}

variable "suffix" {
  type    = string
  default = "9"
}

# ===== From your terraform output =====

variable "cloudfront_domain_name9" {
  type    = string
  default = "dr5o1kixybylp.cloudfront.net"
}

variable "lambda_execution_role_arn9" {
  type    = string
  default = "arn:aws:iam::539468395951:role/sos-lambda-exec-role9"
}

variable "private_subnet_ids9" {
  type = list(string)
  default = [
    "subnet-03468d912c3dfe43c",
    "subnet-0a933024cc7ca3822",
  ]
}

variable "lambda_sg_id9" {
  type    = string
  default = "sg-06965913c0f73e3f8"
}

variable "cognito_user_pool_id9" {
  type    = string
  default = "ca-central-1_uqJSTvWRF"
}

variable "cognito_web_client_id9" {
  type    = string
  default = "1dgrsqdg0n5q51fif01ji0ho87"
}

# Convenience URLs (so you never reference module.s3_cloudfront.* again)
variable "frontend_callback_urls9" {
  type = list(string)
  default = [
    "http://localhost:5173",
    "https://dr5o1kixybylp.cloudfront.net",
  ]
}

variable "frontend_logout_urls9" {
  type = list(string)
  default = [
    "http://localhost:5173",
    "https://dr5o1kixybylp.cloudfront.net",
  ]
}
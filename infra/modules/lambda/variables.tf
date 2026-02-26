variable "project" { type = string }
variable "suffix" { type = string }

variable "lambda_role_arn" { type = string }

variable "private_subnet_ids" { type = list(string) }
variable "lambda_sg_id" { type = string }

variable "dynamodb_tables" {
  type = object({
    products = string
    orders   = string
    users    = string
    carts    = string
  })
}

variable "cognito" {
  type = object({
    user_pool_id  = string
    web_client_id = string
  })
}

variable "region" { type = string }
variable "cloudfront_domain_name" { type = string }

variable "products_zip_path" { type = string }
variable "project" { type = string }
variable "env" { type = string }

variable "cognito_user_pool_id" { type = string }
variable "cognito_app_client_id" { type = string }

# Lambda invoke ARNs (NOT plain ARNs)
variable "products_lambda_invoke_arn" { type = string }
variable "orders_lambda_invoke_arn" { type = string }
variable "carts_lambda_invoke_arn" { type = string }
variable "users_lambda_invoke_arn" { type = string }

# Plain lambda function names (for aws_lambda_permission)
variable "products_lambda_name" { type = string }
variable "orders_lambda_name" { type = string }
variable "carts_lambda_name" { type = string }
variable "users_lambda_name" { type = string }

variable "region" { type = string }
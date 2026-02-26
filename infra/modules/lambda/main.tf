locals {
  name_prefix = var.project
  s           = var.suffix
}

resource "aws_lambda_function" "products" {
  function_name = "${local.name_prefix}-products-handler${local.s}"
  role          = var.lambda_role_arn

  handler       = "index.handler"
  runtime       = "nodejs20.x"
  architectures = ["arm64"]

  filename         = var.products_zip_path
  source_code_hash = filebase64sha256(var.products_zip_path)

  timeout     = 30
  memory_size = 512

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_sg_id]
  }

  environment {
    variables = {
      REGION = var.region

      DDB_PRODUCTS_TABLE = var.dynamodb_tables.products
      DDB_ORDERS_TABLE   = var.dynamodb_tables.orders
      DDB_USERS_TABLE    = var.dynamodb_tables.users
      DDB_CARTS_TABLE    = var.dynamodb_tables.carts

      COGNITO_USER_POOL_ID  = var.cognito.user_pool_id
      COGNITO_WEB_CLIENT_ID = var.cognito.web_client_id

      FRONTEND_URL = "https://${var.cloudfront_domain_name}"
    }
  }

  tracing_config {
    mode = "Active"
  }
}
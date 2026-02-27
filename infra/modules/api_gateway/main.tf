# api-gateway module
resource "aws_apigatewayv2_api" "this" {
  name          = "${var.project}-${var.env}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["authorization", "content-type"]
    max_age       = 3600
  }
}

# CloudWatch logs for API access logs (no CMK; default encryption)
resource "aws_cloudwatch_log_group" "apigw_access" {
  name              = "/aws/apigw/${var.project}-${var.env}-http-api"
  retention_in_days = 14
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = var.env
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.apigw_access.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      ip               = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      latency          = "$context.responseLatency"
      integrationError = "$context.integrationErrorMessage"
    })
  }

  default_route_settings {
    detailed_metrics_enabled = true
    throttling_burst_limit   = 500
    throttling_rate_limit    = 1000
  }
}

# Cognito JWT Authorizer
locals {
  cognito_issuer = "https://cognito-idp.${var.region}.amazonaws.com/${var.cognito_user_pool_id}"
}

resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.this.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.project}-${var.env}-jwt"

  jwt_configuration {
    issuer   = local.cognito_issuer
    audience = [var.cognito_app_client_id]
  }
}

# Integrations
resource "aws_apigatewayv2_integration" "products" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.products_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "orders" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.orders_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "carts" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.carts_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "users" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.users_lambda_invoke_arn
  payload_format_version = "2.0"
}

# Routes (secured by JWT)
# Products
resource "aws_apigatewayv2_route" "products_any" {
  api_id             = aws_apigatewayv2_api.this.id
  route_key          = "ANY /products/{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.products.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# Orders
resource "aws_apigatewayv2_route" "orders_any" {
  api_id             = aws_apigatewayv2_api.this.id
  route_key          = "ANY /orders/{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.orders.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# Carts
resource "aws_apigatewayv2_route" "carts_any" {
  api_id             = aws_apigatewayv2_api.this.id
  route_key          = "ANY /carts/{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.carts.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# Users
resource "aws_apigatewayv2_route" "users_any" {
  api_id             = aws_apigatewayv2_api.this.id
  route_key          = "ANY /users/{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.users.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

# Lambda permissions (API Gateway invoke)
resource "aws_lambda_permission" "products" {
  statement_id  = "AllowAPIGatewayInvokeProducts"
  action        = "lambda:InvokeFunction"
  function_name = var.products_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

resource "aws_lambda_permission" "orders" {
  statement_id  = "AllowAPIGatewayInvokeOrders"
  action        = "lambda:InvokeFunction"
  function_name = var.orders_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

resource "aws_lambda_permission" "carts" {
  statement_id  = "AllowAPIGatewayInvokeCarts"
  action        = "lambda:InvokeFunction"
  function_name = var.carts_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

resource "aws_lambda_permission" "users" {
  statement_id  = "AllowAPIGatewayInvokeUsers"
  action        = "lambda:InvokeFunction"
  function_name = var.users_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}
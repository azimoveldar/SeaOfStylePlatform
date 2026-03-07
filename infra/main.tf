# Module: networking
module "networking" {
  source = "./modules/networking"

  project     = "sos"
  name_suffix = "9"
  region      = "ca-central-1"

  vpc_cidr = "10.0.0.0/16"

  azs = ["ca-central-1a", "ca-central-1b"]

  public_subnet_cidrs  = ["10.0.10.0/24", "10.0.11.0/24"]
  private_subnet_cidrs = ["10.0.20.0/24", "10.0.21.0/24"]

  tags = {
    Environment = "dev"
  }
}

# Module: s3-cloudfront
module "s3_cloudfront" {
  source = "./modules/s3-cloudfront"

  project     = "sos"
  name_suffix = "9"
  region      = "ca-central-1"

  frontend_bucket_name = "sos-frontend9-539468395951"

  tags = {
    Environment = "dev"
  }
}

# Module: dynamodb
module "dynamodb" {
  source  = "./modules/dynamodb"
  project = "sos"
  suffix  = "9"
}

# Module: cognito
module "cognito" {
  source  = "./modules/cognito"
  project = "sos"
  suffix  = "9"

  # ✅ STOP referencing module.s3_cloudfront outputs here.
  callback_urls = [
    "http://localhost:5173",
    "https://${var.cloudfront_domain_name9}"
  ]

  logout_urls = [
    "http://localhost:5173",
    "https://${var.cloudfront_domain_name9}"
  ]
}

# Read DynamoDB table ARNs via data sources
data "aws_dynamodb_table" "products9" { name = module.dynamodb.dynamodb9["products"] }
data "aws_dynamodb_table" "orders9" { name = module.dynamodb.dynamodb9["orders"] }
data "aws_dynamodb_table" "users9" { name = module.dynamodb.dynamodb9["users"] }
data "aws_dynamodb_table" "carts9" { name = module.dynamodb.dynamodb9["carts"] }

# Module: iam
module "iam" {
  source  = "./modules/iam"
  project = "sos"
  suffix  = "9"

  dynamodb_table_arns = [
    data.aws_dynamodb_table.products9.arn,
    data.aws_dynamodb_table.orders9.arn,
    data.aws_dynamodb_table.users9.arn,
    data.aws_dynamodb_table.carts9.arn
  ]
}

############################################
# ✅ LOCALS (NO module.* output guessing)
############################################
locals {
  region9 = var.region

  dynamodb_tables9 = {
    products = module.dynamodb.dynamodb9["products"]
    orders   = module.dynamodb.dynamodb9["orders"]
    users    = module.dynamodb.dynamodb9["users"]
    carts    = module.dynamodb.dynamodb9["carts"]
  }

  cognito9 = {
    user_pool_id  = var.cognito_user_pool_id9
    web_client_id = var.cognito_web_client_id9
  }
}

############################################
# Module: lambda
############################################
module "lambda" {
  source  = "./modules/lambda"
  project = var.project
  suffix  = var.suffix
  region  = var.region

  lambda_role_arn        = var.lambda_execution_role_arn9
  private_subnet_ids     = var.private_subnet_ids9
  lambda_sg_id           = var.lambda_sg_id9
  cloudfront_domain_name = var.cloudfront_domain_name9

  dynamodb_tables = {
    products = module.dynamodb.dynamodb9["products"]
    orders   = module.dynamodb.dynamodb9["orders"]
    users    = module.dynamodb.dynamodb9["users"]
    carts    = module.dynamodb.dynamodb9["carts"]
  }

  cognito = {
    user_pool_id  = var.cognito_user_pool_id9
    web_client_id = var.cognito_web_client_id9
  }

  products_zip_path = "${path.module}/lambda-src/products.zip"
  orders_zip_path   = "${path.module}/lambda-src/orders.zip"
  users_zip_path    = "${path.module}/lambda-src/users.zip"
  carts_zip_path    = "${path.module}/lambda-src/carts.zip"
}
module "api_gateway" {
  source = "./modules/api_gateway"

  project = var.project
  env     = var.env
  region  = var.region

  cognito_user_pool_id  = var.cognito_user_pool_id
  cognito_app_client_id = var.cognito_app_client_id

  products_lambda_invoke_arn = module.lambda.products_invoke_arn
  orders_lambda_invoke_arn   = module.lambda.orders_invoke_arn
  carts_lambda_invoke_arn    = module.lambda.carts_invoke_arn
  users_lambda_invoke_arn    = module.lambda.users_invoke_arn

  products_lambda_name = module.lambda.products_name
  orders_lambda_name   = module.lambda.orders_name
  carts_lambda_name    = module.lambda.carts_name
  users_lambda_name    = module.lambda.users_name
}
module "s3_product_images" {
  source = "./modules/s3-product-images"

  bucket_name = "sos-product-images9-539468395951"

  allowed_origins = [
    "https://${module.s3_cloudfront.cloudfront_domain_name}", # dr5o1kixybylp.cloudfront.net
    "http://localhost:5173"
  ]
}
module "monitoring" {
  source = "./modules/monitoring"

  region = var.region

  trail_name        = "sos-audit-trail9"
  trail_bucket_name = "sos-cloudtrail-logs9-539468395951"

  api_id    = module.api_gateway.api_id
  api_stage = var.env

  lambda_names = [
    "sos-products-handler9",
    "sos-orders-handler9",
    "sos-carts-handler9",
    "sos-users-handler9",
  ]

  ddb_table_names = [
    "sos-products9",
    "sos-orders9",
    "sos-carts9",
    "sos-users9",
  ]

  cloudfront_distribution_id = "E3TDWKA5L1URYF"

  # put your email to receive alarms
  alarm_email = "abhandari33@myseneca.ca"
}
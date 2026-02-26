
# Module: networking
module "networking" {
  source = "./modules/networking"

  project     = "sos"
  name_suffix = "9"
  region      = "ca-central-1"

  vpc_cidr = "10.0.0.0/16"

  azs = ["ca-central-1a", "ca-central-1b"]

  # Different subnets (safe defaults)
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

  # MUST be globally unique
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

  callback_urls = [
    "http://localhost:5173",
    # Use the CloudFront domain output FROM MODULE (not hardcoded)
    "https://${module.s3_cloudfront.cloudfront_domain_name9}"
  ]

  logout_urls = [
    "http://localhost:5173",
    "https://${module.s3_cloudfront.cloudfront_domain_name9}"
  ]
}

# Read DynamoDB table ARNs via data sources (you already had this)
data "aws_dynamodb_table" "products9" { name = module.dynamodb.dynamodb9["products"] }
data "aws_dynamodb_table" "orders9"   { name = module.dynamodb.dynamodb9["orders"] }
data "aws_dynamodb_table" "users9"    { name = module.dynamodb.dynamodb9["users"] }
data "aws_dynamodb_table" "carts9"    { name = module.dynamodb.dynamodb9["carts"] }

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
# LOCALS: single source of truth for lambda
############################################
locals {
  region9 = "ca-central-1"

  # Networking values (from object output you already expose at root: networking9)
  # But inside code we must reference module outputs.
  # Your networking module MUST output these two (it created them and your root outputs show them).
  private_subnet_ids9 = module.networking.private_subnet_ids9
  lambda_sg_id9       = module.networking.lambda_sg_id9

  # CloudFront domain (same)
  cloudfront_domain_name9 = module.s3_cloudfront.cloudfront_domain_name9

  # IAM role arn (same)
  lambda_execution_role_arn9 = module.iam.lambda_execution_role_arn9

  # DynamoDB table names (from dynamodb module output map)
  dynamodb_tables9 = {
    products = module.dynamodb.dynamodb9["products"]
    orders   = module.dynamodb.dynamodb9["orders"]
    users    = module.dynamodb.dynamodb9["users"]
    carts    = module.dynamodb.dynamodb9["carts"]
  }

  # Cognito IDs (from cognito module output map)
  cognito9 = {
    user_pool_id  = module.cognito.cognito9["user_pool_id"]
    web_client_id = module.cognito.cognito9["web_client_id"]
  }
}

############################################
# Module: lambda (PRODUCTS only for now)
############################################
module "lambda" {
  source  = "./modules/lambda"
  project = "sos"
  suffix  = "9"

  lambda_role_arn     = local.lambda_execution_role_arn9
  private_subnet_ids  = local.private_subnet_ids9
  lambda_sg_id        = local.lambda_sg_id9

  dynamodb_tables = local.dynamodb_tables9
  cognito         = local.cognito9

  region                 = local.region9
  cloudfront_domain_name = local.cloudfront_domain_name9

  products_zip_path = "${path.module}/lambda-src/products.zip"
}
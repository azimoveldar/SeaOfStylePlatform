
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
  # Recommended pattern:
  # sos-frontend9-<account-id>
  frontend_bucket_name = "sos-frontend9-539468395951"

  tags = {
    Environment = "dev"
  }
}
module "dynamodb" {
  source  = "./modules/dynamodb"
  project = "sos"
  suffix  = "9"
}
module "cognito" {
  source  = "./modules/cognito"
  project = "sos"
  suffix  = "9"

  callback_urls = [
    "http://localhost:5173",
    "https://dr5o1kixybylp.cloudfront.net"
  ]

  logout_urls = [
    "http://localhost:5173",
    "https://dr5o1kixybylp.cloudfront.net"
  ]
}


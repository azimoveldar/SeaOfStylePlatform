terraform {
  backend "s3" {
    bucket         = "sos-terraform-state-539468395951"
    key            = "sos/terraform.tfstate"
    region         = "ca-central-1"
    dynamodb_table = "sos-terraform-locks"
    encrypt        = true
  }
}

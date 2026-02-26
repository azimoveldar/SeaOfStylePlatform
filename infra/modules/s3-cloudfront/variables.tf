
# S3 + CloudFront Inputs    #

variable "project" {
  type        = string
  description = "Project prefix (example: sos)"
  default     = "sos"
}

variable "name_suffix" {
  type        = string
  description = "Suffix appended to names to avoid collisions (example: 9)"
  default     = "9"
}

variable "region" {
  type        = string
  description = "AWS region (S3 bucket region)"
  default     = "ca-central-1"
}

# IMPORTANT: bucket names must be globally unique
variable "frontend_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for frontend"
}

# ACM cert + domain ready
variable "domain_name" {
  type        = string
  description = "Optional custom domain (example: www.example.com)"
  default     = null
}

variable "acm_certificate_arn" {
  type        = string
  description = "Optional ACM cert ARN in us-east-1 for CloudFront"
  default     = null
}

variable "tags" {
  type        = map(string)
  description = "Common tags"
  default     = {}
}
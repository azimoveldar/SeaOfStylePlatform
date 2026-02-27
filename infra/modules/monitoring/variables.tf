variable "trail_bucket_name" { type = string }
variable "trail_name" { type = string }
variable "region" { type = string }

variable "api_id" { type = string }
variable "api_stage" { type = string }

variable "lambda_names" { type = list(string) }
variable "ddb_table_names" { type = list(string) }

variable "cloudfront_distribution_id" { type = string }

# optional
variable "alarm_email" {
  type    = string
  default = ""
}
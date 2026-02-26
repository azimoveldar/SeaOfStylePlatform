variable "project" { type = string }
variable "suffix" { type = string }

variable "dynamodb_table_arns" {
  type = list(string)
}
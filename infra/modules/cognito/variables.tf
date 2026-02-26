variable "project" { type = string }
variable "suffix"  { type = string }

# Keep these flexible
variable "callback_urls" {
  type = list(string)
}

variable "logout_urls" {
  type = list(string)
}
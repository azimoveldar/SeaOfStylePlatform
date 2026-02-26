variable "project" {
  type        = string
  description = "Project name prefix for tags/names"
  default     = "sos"
}

variable "region" {
  type        = string
  description = "AWS region"
  default     = "ca-central-1"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR"
  default     = "10.0.0.0/16"
}

variable "azs" {
  type        = list(string)
  description = "AZs to use (2 AZs recommended)"
  default     = ["ca-central-1a", "ca-central-1b"]
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "Public subnet CIDRs (one per AZ)"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "Private subnet CIDRs (one per AZ)"
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "tags" {
  type        = map(string)
  description = "Extra tags"
  default     = {}
}
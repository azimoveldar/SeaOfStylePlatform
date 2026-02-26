#############################
# Networking Module Inputs  #
#############################

# Project prefix used in naming (doc uses "sos")
variable "project" {
  type        = string
  description = "Project prefix for resource naming (example: sos)"
  default     = "sos"
}

# Suffix for collision-proof naming (your rule: use 9)
variable "name_suffix" {
  type        = string
  description = "Suffix appended to ALL resource names to avoid collisions (example: 9)"
  default     = "9"
}

# AWS region
variable "region" {
  type        = string
  description = "AWS region"
  default     = "ca-central-1"
}

# VPC CIDR (you said keep same as guide)
variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR range"
  default     = "10.0.0.0/16"
}

# Two AZs for HA
variable "azs" {
  type        = list(string)
  description = "Two availability zones"
  default     = ["ca-central-1a", "ca-central-1b"]
}

# Public subnet CIDRs (DIFFERENT from guide; safe defaults)
variable "public_subnet_cidrs" {
  type        = list(string)
  description = "Two public subnet CIDRs"
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

# Private subnet CIDRs (DIFFERENT from guide; safe defaults)
variable "private_subnet_cidrs" {
  type        = list(string)
  description = "Two private subnet CIDRs (Lambda subnets)"
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

# Optional tags you want on everything
variable "tags" {
  type        = map(string)
  description = "Common tags applied to all resources"
  default     = {}
}
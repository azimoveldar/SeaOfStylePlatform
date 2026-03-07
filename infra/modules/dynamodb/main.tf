locals {
  name_prefix = var.project
  suffix      = var.suffix
}

############################
# Products Table
############################

resource "aws_dynamodb_table" "products" {
  name         = "${local.name_prefix}-products${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "productId"

  attribute {
    name = "productId"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  attribute {
    name = "isFeatured"
    type = "S"
  }

  global_secondary_index {
    name            = "category-index"
    hash_key        = "category"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "featured-index"
    hash_key        = "isFeatured"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

############################
# Orders Table
############################

resource "aws_dynamodb_table" "orders" {
  name         = "${local.name_prefix}-orders${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "customer-orders-index"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

############################
# Users Table
############################

resource "aws_dynamodb_table" "users" {
  name         = "${local.name_prefix}-users${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

############################
# Carts Table
############################

resource "aws_dynamodb_table" "carts" {
  name         = "${local.name_prefix}-carts${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}
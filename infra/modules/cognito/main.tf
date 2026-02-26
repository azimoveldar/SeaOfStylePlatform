locals {
  name_prefix = var.project
  s           = var.suffix
}

resource "aws_cognito_user_pool" "this" {
  name = "${local.name_prefix}-userpool${local.s}"

  # Sign-in options: Email (required), Username optional per guide
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable             = true
    required            = true

    string_attribute_constraints {
      min_length = 1
      max_length = 2048
    }
  }

  # Optional custom attribute (role) from guide
  schema {
    name                = "role"
    attribute_data_type = "String"
    mutable             = true
    required            = false

    string_attribute_constraints {
      min_length = 1
      max_length = 20
    }
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.name_prefix}-web-client${local.s}"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  supported_identity_providers = ["COGNITO"]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls
}

resource "aws_cognito_user_group" "admins" {
  name         = "${local.name_prefix}-admins${local.s}"
  description  = "Sea of Style admin users"
  user_pool_id = aws_cognito_user_pool.this.id
}

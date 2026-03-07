output "user_pool_id9" {
  value = aws_cognito_user_pool.this.id
}

output "user_pool_arn9" {
  value = aws_cognito_user_pool.this.arn
}

output "web_client_id9" {
  value = aws_cognito_user_pool_client.web.id
}

output "admins_group_name9" {
  value = aws_cognito_user_group.admins.name
}

output "cognito9" {
  value = {
    user_pool_id      = aws_cognito_user_pool.this.id
    web_client_id     = aws_cognito_user_pool_client.web.id
    admins_group_name = aws_cognito_user_group.admins.name
  }
}
output "lambda9" {
  value = {
    products_lambda_name = aws_lambda_function.products.function_name
    products_lambda_arn  = aws_lambda_function.products.arn
    orders_lambda_name   = aws_lambda_function.orders.function_name
    orders_lambda_arn    = aws_lambda_function.orders.arn
    users_lambda_name    = aws_lambda_function.users.function_name
    users_lambda_arn     = aws_lambda_function.users.arn
    carts_lambda_name    = aws_lambda_function.carts.function_name
    carts_lambda_arn     = aws_lambda_function.carts.arn
  }
}

output "products_lambda_arn9" {
  value = aws_lambda_function.products.arn
}

output "products_lambda_name9" {
  value = aws_lambda_function.products.function_name
}
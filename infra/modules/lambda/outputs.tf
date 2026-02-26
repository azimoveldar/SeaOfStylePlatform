output "products_lambda_arn9" {
  value = aws_lambda_function.products.arn
}

output "products_lambda_name9" {
  value = aws_lambda_function.products.function_name
}

output "lambda9" {
  value = {
    products_lambda_name = aws_lambda_function.products.function_name
    products_lambda_arn  = aws_lambda_function.products.arn
  }
}
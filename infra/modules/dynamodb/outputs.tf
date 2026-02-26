output "products_table_name9" {
  value = aws_dynamodb_table.products.name
}

output "orders_table_name9" {
  value = aws_dynamodb_table.orders.name
}

output "users_table_name9" {
  value = aws_dynamodb_table.users.name
}

output "carts_table_name9" {
  value = aws_dynamodb_table.carts.name
}

output "dynamodb9" {
  value = {
    products = aws_dynamodb_table.products.name
    orders   = aws_dynamodb_table.orders.name
    users    = aws_dynamodb_table.users.name
    carts    = aws_dynamodb_table.carts.name
  }
}
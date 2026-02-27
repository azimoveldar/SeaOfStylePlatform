output "api_endpoint" {
  value = aws_apigatewayv2_api.this.api_endpoint
}

output "invoke_url" {
  value = "${aws_apigatewayv2_api.this.api_endpoint}/${aws_apigatewayv2_stage.prod.name}"
}

output "api_id" {
  value = aws_apigatewayv2_api.this.id
}
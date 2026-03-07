output "lambda_execution_role_arn9" {
  value = aws_iam_role.lambda_exec.arn
}

output "lambda_execution_role_name9" {
  value = aws_iam_role.lambda_exec.name
}

output "iam9" {
  value = {
    lambda_execution_role_arn  = aws_iam_role.lambda_exec.arn
    lambda_execution_role_name = aws_iam_role.lambda_exec.name
  }
}
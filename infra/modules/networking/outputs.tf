###########################
# Networking Module Outputs
###########################

output "vpc_id" {
  value       = aws_vpc.this.id
  description = "VPC ID"
}

output "public_subnet_ids" {
  value       = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  description = "Public subnet IDs"
}

output "private_subnet_ids" {
  value       = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  description = "Private subnet IDs (Lambda subnets)"
}

output "lambda_sg_id" {
  value       = aws_security_group.lambda.id
  description = "Lambda security group ID"
}

output "endpoint_sg_id" {
  value       = aws_security_group.endpoints.id
  description = "VPC endpoint security group ID"
}

output "nat_gateway_ids" {
  value       = [aws_nat_gateway.a.id, aws_nat_gateway.b.id]
  description = "NAT gateway IDs"
}
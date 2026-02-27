output "sns_topic_arn" { value = aws_sns_topic.alerts.arn }
output "cloudtrail_name" { value = aws_cloudtrail.this.name }
output "cloudtrail_bucket" { value = aws_s3_bucket.trail.bucket }
output "dashboard_name" { value = aws_cloudwatch_dashboard.this.dashboard_name }
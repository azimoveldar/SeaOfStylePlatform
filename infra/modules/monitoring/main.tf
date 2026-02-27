# SNS topic for alerts
resource "aws_sns_topic" "alerts" {
  name = "sos-notifications9"
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alarm_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# CloudTrail S3 bucket (NO CMK => SSE-S3 AES256)
resource "aws_s3_bucket" "trail" {
  bucket = var.trail_bucket_name
}

resource "aws_s3_bucket_public_access_block" "trail" {
  bucket                  = aws_s3_bucket.trail.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "trail" {
  bucket = aws_s3_bucket.trail.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_iam_policy_document" "trail_bucket_policy" {
  statement {
    sid       = "AWSCloudTrailAclCheck"
    effect    = "Allow"
    actions   = ["s3:GetBucketAcl"]
    resources = [aws_s3_bucket.trail.arn]
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }

  statement {
    sid       = "AWSCloudTrailWrite"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.trail.arn}/AWSLogs/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "s3:x-amz-acl"
      values   = ["bucket-owner-full-control"]
    }
  }
}

resource "aws_s3_bucket_policy" "trail" {
  bucket = aws_s3_bucket.trail.id
  policy = data.aws_iam_policy_document.trail_bucket_policy.json
}

resource "aws_cloudtrail" "this" {
  name                          = var.trail_name
  s3_bucket_name                = aws_s3_bucket.trail.bucket
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_logging                = true

  # Management events: Read + Write (per guide)
  event_selector {
    read_write_type           = "All"
    include_management_events = true

    # Data events: S3 all buckets (read+write) (per guide)
    data_resource {
      type   = "AWS::S3::Object"
      values = ["arn:aws:s3:::"]
    }
  }

  # Insights: API call rate + Error rate (per guide)
  insight_selector { insight_type = "ApiCallRateInsight" }
  insight_selector { insight_type = "ApiErrorRateInsight" }
}

# CloudWatch dashboard (per guide)
resource "aws_cloudwatch_dashboard" "this" {
  dashboard_name = "sos-overview9"

  dashboard_body = jsonencode({
    widgets = concat(
      [for fn in var.lambda_names : {
        type = "metric", x = 0, y = 0, width = 12, height = 6,
        properties = {
          region  = var.region
          title   = "Lambda Errors - ${fn}"
          metrics = [["AWS/Lambda", "Errors", "FunctionName", fn]]
          period  = 300
          stat    = "Sum"
        }
      }],
      [{
        type = "metric", x = 12, y = 0, width = 12, height = 6,
        properties = {
          region = var.region,
          title  = "API Gateway 4XX/5XX + Latency",
          metrics = [
            ["AWS/ApiGateway", "4XXError", "ApiId", var.api_id, "Stage", var.api_stage],
            ["AWS/ApiGateway", "5XXError", "ApiId", var.api_id, "Stage", var.api_stage],
            ["AWS/ApiGateway", "Latency", "ApiId", var.api_id, "Stage", var.api_stage]
          ],
          period = 300, stat = "Sum"
        }
      }],
      [for t in var.ddb_table_names : {
        type = "metric", x = 0, y = 6, width = 12, height = 6,
        properties = {
          region  = var.region,
          title   = "DynamoDB Throttles - ${t}",
          metrics = [["AWS/DynamoDB", "ThrottledRequests", "TableName", t]],
          period  = 300, stat = "Sum"
        }
      }],
      [{
        type = "metric", x = 0, y = 12, width = 24, height = 6,
        properties = {
          region = "us-east-1",
          title  = "CloudFront Requests & Error Rate (Global)",
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", var.cloudfront_distribution_id, "Region", "Global"],
            [".", "4xxErrorRate", ".", ".", ".", "."],
            [".", "5xxErrorRate", ".", ".", ".", "."]
          ],
          period = 300, stat = "Sum"
        }
      }]
    )
  })
}

# Alarms (per guide thresholds)
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = toset(var.lambda_names)

  alarm_name          = "sos-${each.value}-errors"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  dimensions          = { FunctionName = each.value }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "lambda_duration_p99" {
  for_each = toset(var.lambda_names)

  alarm_name          = "sos-${each.value}-duration-p99"
  namespace           = "AWS/Lambda"
  metric_name         = "Duration"
  dimensions          = { FunctionName = each.value }
  extended_statistic  = "p99"
  period              = 300
  evaluation_periods  = 1
  threshold           = 25000
  comparison_operator = "GreaterThanOrEqualToThreshold"

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "sos-api-5xx"
  namespace           = "AWS/ApiGateway"
  metric_name         = "5XXError"
  dimensions          = { ApiId = var.api_id, Stage = var.api_stage }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 5
  comparison_operator = "GreaterThanOrEqualToThreshold"

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "ddb_throttles" {
  for_each = toset(var.ddb_table_names)

  alarm_name          = "sos-${each.value}-ddb-throttles"
  namespace           = "AWS/DynamoDB"
  metric_name         = "ThrottledRequests"
  dimensions          = { TableName = each.value }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"

  alarm_actions = [aws_sns_topic.alerts.arn]
}

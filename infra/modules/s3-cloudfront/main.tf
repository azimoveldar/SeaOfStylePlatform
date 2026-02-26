# s3-cloudfront module
############################################
# S3 (Private) + CloudFront (OAC) Frontend #
############################################

data "aws_caller_identity" "current" {}

locals {
  base_tags = merge(var.tags, {
    Project = var.project
    Suffix  = var.name_suffix
  })

  # CloudFront origin id label
  origin_id = "${var.project}-frontend-origin${var.name_suffix}"
}

########################
# 1) S3 Frontend Bucket #
########################
resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name
  tags   = merge(local.base_tags, { Name = "${var.project}-frontend-bucket${var.name_suffix}" })
}

# Block all public access (bucket stays private)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Recommended for safety
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Optional: server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

########################################
# 2) CloudFront Origin Access Control   #
########################################
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.project}-frontend-oac${var.name_suffix}"
  description                       = "OAC for private S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

############################
# 3) CloudFront Distribution
############################
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  comment             = "${var.project}-frontend-cdn${var.name_suffix}"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  # Origin: private S3 bucket with OAC
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = local.origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    compress         = true

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }

    # Managed cache policy is better, but this works simply:
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # SPA fallback: map 403/404 to index.html
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.acm_certificate_arn == null
    acm_certificate_arn            = var.acm_certificate_arn
    ssl_support_method             = var.acm_certificate_arn == null ? null : "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  # If domain is set, attach it
  aliases = var.domain_name == null ? [] : [var.domain_name]

  tags = merge(local.base_tags, { Name = "${var.project}-frontend-cdn${var.name_suffix}" })
}

########################################
# 4) Allow CloudFront to read the bucket
########################################
data "aws_iam_policy_document" "frontend_bucket_policy" {
  statement {
    sid = "AllowCloudFrontReadOAC"

    actions = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_bucket_policy.json
}
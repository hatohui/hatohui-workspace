resource "cloudflare_r2_bucket" "this" {
  account_id = var.cloudflare_account_id
  name       = var.bucket_name
  location   = var.location
}

resource "cloudflare_r2_custom_domain" "this" {
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.this.name
  domain      = var.domain_name
  zone_id     = var.zone_id
  enabled     = true
  min_tls     = "1.2"
}

resource "cloudflare_r2_bucket_cors" "this" {
  count = length(var.cors_allowed_origins) > 0 ? 1 : 0

  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.this.name
  rules = [{
    id = "frontend-presigned-uploads"
    allowed = {
      methods = ["GET", "PUT"]
      origins = var.cors_allowed_origins
      headers = ["content-type"]
    }
    max_age_seconds = 3600
  }]
}

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

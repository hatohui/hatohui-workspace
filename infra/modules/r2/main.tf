resource "cloudflare_r2_bucket" "this" {
  account_id = var.cloudflare_account_id
  name       = var.bucket_name
  location   = var.location
}

# cloudflare_r2_custom_domain does not support `terraform import`. The
# pre-existing live binding for domain_name was deleted out-of-band so this
# resource creates it fresh on first apply, instead of conflicting with it.
resource "cloudflare_r2_custom_domain" "this" {
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.this.name
  domain      = var.domain_name
  zone_id     = var.zone_id
  enabled     = true
  min_tls     = "1.2"
}

output "bucket_name" {
  description = "The R2 bucket name"
  value       = cloudflare_r2_bucket.this.name
}

output "public_url" {
  description = "The public URL objects are reachable at"
  value       = "https://${var.domain_name}"
}

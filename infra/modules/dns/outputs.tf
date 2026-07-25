output "zone_id" {
  description = "The Cloudflare zone ID"
  value       = data.cloudflare_zone.this.id
}

output "record_fqdns" {
  description = "The fully qualified name of each created record, keyed the same as var.records"
  value       = { for key, record in cloudflare_dns_record.this : key => record.name }
}

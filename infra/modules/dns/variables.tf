variable "zone_name" {
  description = "The Cloudflare root zone to create records in (e.g. example.com)"
  type        = string
}

variable "records" {
  description = "DNS records to create, keyed by an arbitrary unique label (not necessarily the record name — two records, e.g. both TXT, can share the same name)"
  type = map(object({
    name    = string
    type    = string
    content = string
    ttl     = optional(number, 1)
    proxied = optional(bool, false)
  }))
  default = {}
}

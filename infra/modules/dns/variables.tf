variable "zone_name" {
  description = "The Cloudflare root zone to create records in (e.g. example.com)"
  type        = string
}

variable "records" {
  description = "DNS records to create, keyed by a unique label"
  type = map(object({
    name    = string
    type    = string
    content = string
    ttl     = optional(number, 1)
    proxied = optional(bool, false)
  }))
  default = {}
}

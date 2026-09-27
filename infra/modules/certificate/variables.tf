variable "domain_name" {
  description = "The domain name to request an ACM certificate for"
  type        = string
}

variable "validation_record_fqdns" {
  description = "The DNS validation record FQDNs that prove domain ownership"
  type        = list(string)
}

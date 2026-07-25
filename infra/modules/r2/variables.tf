variable "cloudflare_account_id" {
  description = "The Cloudflare account ID that owns the R2 bucket"
  type        = string
}

variable "zone_id" {
  description = "The Cloudflare zone ID that owns domain_name"
  type        = string
}

variable "bucket_name" {
  description = "The R2 bucket name"
  type        = string
}

variable "domain_name" {
  description = "The public custom domain to bind to the bucket (e.g. assets.example.com)"
  type        = string
}

variable "location" {
  description = "The R2 bucket's primary storage region"
  type        = string
  default     = "wnam"
}

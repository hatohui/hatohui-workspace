variable "cloudflare_account_id" {
  description = "The Cloudflare account ID that owns the Pages project"
  type        = string
}

variable "project_name" {
  description = "The Pages project name (also used as the <name>.pages.dev subdomain)"
  type        = string
}

variable "production_branch" {
  description = "The git branch treated as production (deployments are direct-upload, so this is metadata only)"
  type        = string
  default     = "master"
}

variable "domain_name" {
  description = "The custom domain to attach to the Pages project (e.g. friends.example.com)"
  type        = string
}

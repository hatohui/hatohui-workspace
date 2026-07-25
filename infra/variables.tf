//=== ** AWS Variables **/ ===
variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
}

// === ** Cloudflare Variables **/ ===
variable "upstash_api_key" {
  description = "The Upstash API key for accessing the Upstash service"
  type        = string
}

// === ** Google Cloud Variables **/ === 
variable "gcp_project" {
  description = "The GCP project to deploy resources in"
  type        = string
}

variable "gcp_region" {
  description = "The GCP region to deploy resources in"
  type        = string
}

//=== ** Doppler Variables **/ ===
variable "doppler_project" {
  description = "The Doppler project to use for secrets management"
  type        = string
}

variable "doppler_config" {
  description = "The Doppler config to use for secrets management"
  type        = string
}

variable "doppler_token" {
  description = "The Doppler service token used to authenticate the Doppler provider"
  type        = string
  sensitive   = true
}

variable "target_doppler_project" {
  description = "The Doppler project to read secrets/outputs from, separate from the local project used to inject the Doppler token"
  type        = string
}

variable "target_doppler_config" {
  description = "The Doppler config to read secrets/outputs from, separate from the local config used to inject the Doppler token"
  type        = string
}

// === ** Personal Variables **/ ===
variable "personal_email" {
  description = "The personal email address to use for Upstash"
  type        = string
}

variable "project_name" {
  description = "The name of the project for which the database is being created"
  type        = string
}

// === ** API / Lambda Variables **/ ===
variable "cloudflare_zone_name" {
  description = "The Cloudflare root zone that owns the API's custom domain (e.g. example.com)"
  type        = string
}

variable "cloudflare_account_id" {
  description = "The Cloudflare account ID that owns Pages projects and R2 buckets"
  type        = string
}

variable "cloudflare_api_token" {
  description = "A Cloudflare API token (Pages:Edit) published to GitHub Actions for `wrangler pages deploy`"
  type        = string
  sensitive   = true
}

variable "api_image_tag" {
  description = "The tag of the apps/api image in ECR to deploy to Lambda"
  type        = string
  default     = "latest"
}

variable "github_repository" {
  description = "The GitHub repository allowed to assume the CI deploy role via OIDC, as \"owner/repo\""
  type        = string
  default     = "hatohui/hatohui-workspace"
}

variable "github_token" {
  description = "A GitHub personal access token (repo + actions:write scope) used to publish CI variables"
  type        = string
  sensitive   = true
}

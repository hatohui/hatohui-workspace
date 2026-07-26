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

variable "api_doppler_config" {
  description = "The Doppler config Terraform writes apps/api's secrets into, i.e. the config the API reads at runtime. Scoped per app (prod_api, prod_friends, prod_www, ...) as branch configs under the prod environment."
  type        = string
  default     = "prod_api"
}

// === ** Google OAuth Variables **/ ===
variable "google_oauth_client_id" {
  description = "The OAuth 2.0 Web client ID from the Google Cloud console; Google has no API to create one, so it is created by hand and adopted here"
  type        = string
}

variable "google_oauth_client_secret" {
  description = "The OAuth 2.0 Web client secret matching google_oauth_client_id"
  type        = string
  sensitive   = true
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
  description = "A GitHub token used to publish CI variables/secrets. Fine-grained: scoped to github_repository, with Secrets (read/write) and Variables (read/write) permissions. Classic: repo scope."
  type        = string
  sensitive   = true
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "aws" {
  region     = var.aws_region
  access_key = module.secrets.aws_access_key_id
  secret_key = module.secrets.aws_secret_access_key
}

provider "neon" {
  api_key = module.secrets.neon_token
}

provider "upstash" {
  api_key = var.upstash_api_key
  email   = var.personal_email
}

provider "google" {
  project     = var.gcp_project
  region      = var.gcp_region
  credentials = module.secrets.gcp_credentials_json
}

provider "doppler" {
  doppler_token = var.doppler_token
}

provider "github" {
  token = var.github_token
  owner = split("/", var.github_repository)[0]
}

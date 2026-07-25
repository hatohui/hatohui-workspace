provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "aws" {
  region = var.aws_region
}

provider "neon" {
}

provider "upstash" {
  api_key = var.upstash_api_key
  email   = var.personal_email
}

provider "google" {
}

provider "doppler" {
  doppler_token = var.doppler_token
}

provider "github" {
  token = var.github_token
  owner = split("/", var.github_repository)[0]
}

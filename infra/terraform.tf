terraform {
  required_version = "1.15.8"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.22.0"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "6.56.0"
    }

    neon = {
      source  = "kislerdm/neon"
      version = "0.14.0"
    }

    upstash = {
      source  = "upstash/upstash"
      version = "2.1.0"
    }

    doppler = {
      source  = "DopplerHQ/doppler"
      version = "1.21.4"
    }

    google = {
      source  = "hashicorp/google"
      version = "7.41.0"
    }

    github = {
      source  = "integrations/github"
      version = "6.13.0"
    }
  }

  cloud {
    organization = "hatohui"

    workspaces {
      name = "hatohui"
    }
  }
}
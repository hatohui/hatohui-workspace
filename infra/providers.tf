terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.22.0"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "6.56.0"
    }
  }
}

provider "cloudflare" {
}

provider "aws" {
}
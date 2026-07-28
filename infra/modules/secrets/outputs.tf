output "aws_access_key_id" {
  description = "The AWS access key ID retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["AWS_ACCESS_KEY_ID"]
  sensitive   = true
}

output "aws_secret_access_key" {
  description = "The AWS secret access key retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["AWS_SECRET_ACCESS_KEY"]
  sensitive   = true
}

output "neon_token" {
  description = "The Neon token retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["NEON_TOKEN"]
  sensitive   = true
}

output "gcp_credentials_json" {
  description = "The GCP service account key (JSON), retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["GCP_CREDENTIALS_JSON"]
  sensitive   = true
}

output "api_domain" {
  description = "The custom domain for the API, retrieved from Doppler secrets"
  value       = nonsensitive(data.doppler_secrets.this.map["API_DOMAIN"])
}

output "r2_access_key_id" {
  description = "The R2 (S3-compatible) API token's access key ID, retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["CLOUDFLARE_ACCESS_KEY_ID"]
  sensitive   = true
}

output "r2_secret_access_key" {
  description = "The R2 (S3-compatible) API token's secret access key, retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["CLOUDFLARE_SECRET_ACCESS_KEY"]
  sensitive   = true
}

output "email_api_key" {
  description = "The transactional email provider's API key, retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["EMAIL_API_KEY"]
  sensitive   = true
}

output "session_jwt_secret" {
  description = "The secret used to sign session JWTs, retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["SESSION_JWT_SECRET"]
  sensitive   = true
}

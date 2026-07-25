output "aws_access_key_id" {
  description = "The AWS access key ID retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["AWS_ACCESS_KEY_ID"]
}

output "aws_secret_access_key" {
  description = "The AWS secret access key retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["AWS_SECRET_ACCESS_KEY"]
}

output "neon_token" {
  description = "The Neon token retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["NEON_TOKEN"]
}

output "api_domain" {
  description = "The custom domain for the API, retrieved from Doppler secrets"
  value       = data.doppler_secrets.this.map["API_DOMAIN"]
}
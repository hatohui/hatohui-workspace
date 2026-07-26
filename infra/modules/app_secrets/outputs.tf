output "managed_secret_names" {
  description = "The names of the secrets Terraform manages in the target config"
  value       = sort(keys(doppler_secret.this))
}

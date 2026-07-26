output "client_id" {
  description = "The OAuth 2.0 Web client ID"
  value       = var.client_id
}

output "client_secret" {
  description = "The OAuth 2.0 Web client secret"
  value       = var.client_secret
  sensitive   = true
}

output "redirect_uri" {
  description = "The production redirect URI, used as GOOGLE_OAUTH_REDIRECT_URI at runtime"
  value       = "https://${var.api_domain}${var.callback_path}"
}

output "all_redirect_uris" {
  description = "Every redirect URI to register under the client's Authorized redirect URIs (production + additional_redirect_uris, e.g. local dev)"
  value       = concat(["https://${var.api_domain}${var.callback_path}"], var.additional_redirect_uris)
}

output "javascript_origins" {
  description = "The origins to register under the client's Authorized JavaScript origins"
  value       = var.web_origins
}

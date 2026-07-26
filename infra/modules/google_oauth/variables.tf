variable "gcp_project" {
  description = "The GCP project that owns the OAuth consent screen and client"
  type        = string
}

variable "enabled_services" {
  description = "The Google APIs to enable in the project for the sign-in flow"
  type        = set(string)
  default     = ["people.googleapis.com"]
}

variable "api_domain" {
  description = "The API's public domain, used to derive the OAuth redirect URI (e.g. api.example.com)"
  type        = string
}

variable "callback_path" {
  description = "The path on api_domain that Google redirects back to after consent"
  type        = string
  default     = "/auth/google/callback"
}

variable "web_origins" {
  description = "The browser origins allowed to start the OAuth flow, for the client's Authorized JavaScript origins"
  type        = list(string)
  default     = []
}

variable "additional_redirect_uris" {
  description = "Extra redirect URIs to register alongside the computed production one (e.g. local dev callbacks)"
  type        = list(string)
  default     = []
}

variable "client_id" {
  description = "The OAuth 2.0 Web client ID created in the Google Cloud console (Google exposes no API to create it)"
  type        = string
}

variable "client_secret" {
  description = "The OAuth 2.0 Web client secret created in the Google Cloud console"
  type        = string
  sensitive   = true
}

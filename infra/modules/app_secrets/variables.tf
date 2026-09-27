variable "doppler_project" {
  description = "The Doppler project the application secrets are written to"
  type        = string
}

variable "doppler_config" {
  description = "The Doppler config the secrets are written to"
  type        = string
}

variable "secrets" {
  description = "Secrets to write, as name => value"
  type        = map(string)
  sensitive   = true
}

variable "visibility" {
  description = "The visibility applied to every managed secret"
  type        = string
  default     = "masked"
}

variable "doppler_project" {
  description = "The Doppler project the application secrets are written to"
  type        = string
}

variable "doppler_config" {
  description = "The Doppler config the application secrets are written to (the config apps read at runtime)"
  type        = string
}

variable "secrets" {
  description = "The secrets Terraform owns, as name => value. Terraform is the source of truth: edits made in the Doppler UI are reverted on the next apply"
  type        = map(string)
  sensitive   = true
}

variable "visibility" {
  description = "The visibility applied to every managed secret"
  type        = string
  default     = "masked"
}

variable "environment" {
  description = "The Doppler environment to create doppler_config under. Leave null when the config already exists outside Terraform"
  type        = string
  default     = null
}

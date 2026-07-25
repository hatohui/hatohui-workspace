variable "repository_name" {
  description = "The repository name (without the owner) to publish Actions variables to"
  type        = string
}

variable "variables" {
  description = "GitHub Actions repository variables to publish, as name => value"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "GitHub Actions repository secrets to publish, as name => value"
  type        = map(string)
  default     = {}
  sensitive   = true
}

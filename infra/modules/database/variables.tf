variable "project_name" {
  description = "The name of the project for which the database is being created"
  type        = string
}

variable "branch" {
  description = "The name of the branch for the database being created"
  type        = string
  default     = "main"
}
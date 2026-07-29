variable "project_name" {
  description = "The name of the project for which the database is being created"
  type        = string
}

variable "branch" {
  description = "The name of the branch for the database being created"
  type        = string
  default     = "main"
}

variable "region_id" {
  description = "The Neon region ID to provision the project in (e.g. aws-ap-southeast-1)"
  type        = string
  default     = "aws-ap-southeast-1"
}
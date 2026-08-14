variable "project_name" {
  description = "The name of the project, used to prefix created resources"
  type        = string
}

variable "api_domain" {
  description = "The API's custom domain (e.g. api.hatohui.com) that the schedules call over HTTPS"
  type        = string
}

variable "admin_api_key" {
  description = "The ADMIN_API_KEY value sent as the x-admin-key header on every invocation"
  type        = string
  sensitive   = true
}

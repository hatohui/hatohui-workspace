variable "function_name" {
  description = "The name of the Lambda function"
  type        = string
}

variable "image_uri" {
  description = "The ECR image URI (including tag) to deploy"
  type        = string
}

variable "role_arn" {
  description = "The ARN of the IAM role the function assumes"
  type        = string
}

variable "environment_variables" {
  description = "Environment variables passed to the function"
  type        = map(string)
  default     = {}
}

variable "memory_size" {
  description = "Amount of memory in MB the function can use at runtime"
  type        = number
  default     = 512
}

variable "timeout" {
  description = "Amount of time the function has to run, in seconds"
  type        = number
  default     = 30
}

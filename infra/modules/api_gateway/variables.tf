variable "api_name" {
  description = "The name of the HTTP API"
  type        = string
}

variable "domain_name" {
  description = "The fully qualified custom domain name to attach to the API (e.g. api.example.com)"
  type        = string
}

variable "certificate_arn" {
  description = "The ARN of a validated ACM certificate covering domain_name"
  type        = string
}

variable "lambda_function_name" {
  description = "The name of the Lambda function to integrate with"
  type        = string
}

variable "lambda_function_arn" {
  description = "The ARN of the Lambda function to integrate with"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "The invoke ARN of the Lambda function to integrate with"
  type        = string
}

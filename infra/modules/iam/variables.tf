variable "role_name" {
  description = "The name of the IAM role assumed by the Lambda function"
  type        = string
}

variable "github_repository" {
  description = "The GitHub repository allowed to assume the deploy role, as \"owner/repo\""
  type        = string
}

variable "github_deploy_refs" {
  description = "Git refs (e.g. \"refs/heads/master\") allowed to assume the deploy role via OIDC"
  type        = list(string)
  default     = ["refs/heads/master"]
}

variable "github_deploy_role_name" {
  description = "The name of the IAM role GitHub Actions assumes to deploy the API"
  type        = string
}

variable "ecr_repository_name" {
  description = "The name of the ECR repository the deploy role is allowed to push to"
  type        = string
}

variable "lambda_function_name" {
  description = "The name of the Lambda function the deploy role is allowed to update"
  type        = string
}

output "lambda_role_arn" {
  description = "The ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_exec.arn
}

output "lambda_role_name" {
  description = "The name of the Lambda execution role"
  value       = aws_iam_role.lambda_exec.name
}

output "github_deploy_role_arn" {
  description = "The ARN of the IAM role GitHub Actions assumes to deploy the API"
  value       = aws_iam_role.github_deploy.arn
}

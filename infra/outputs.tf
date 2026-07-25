output "api_ecr_repository_url" {
  description = "The ECR repository URL to push the apps/api image to"
  value       = module.ecr.repository_url
}

output "api_lambda_function_name" {
  description = "The name of the apps/api Lambda function"
  value       = module.lambda.function_name
}

output "api_url" {
  description = "The public URL the API is reachable at"
  value       = module.api_gateway.custom_domain_url
}

output "github_deploy_role_arn" {
  description = "The IAM role ARN GitHub Actions assumes (via OIDC) to deploy the API"
  value       = module.iam.github_deploy_role_arn
}

output "aws_region" {
  description = "The AWS region resources are deployed in"
  value       = var.aws_region
}

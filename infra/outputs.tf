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

output "google_oauth_redirect_uri" {
  description = "The production redirect URI, used as GOOGLE_OAUTH_REDIRECT_URI at runtime"
  value       = module.google_oauth.redirect_uri
}

output "google_oauth_all_redirect_uris" {
  description = "Every redirect URI (production + local dev) to paste into the Google OAuth client's Authorized redirect URIs"
  value       = module.google_oauth.all_redirect_uris
}

output "google_oauth_javascript_origins" {
  description = "The JavaScript origins that must be registered on the Google OAuth client"
  value       = module.google_oauth.javascript_origins
}

output "api_managed_secret_names" {
  description = "The secrets Terraform writes into apps/api's runtime Doppler config (prod_api)"
  value       = module.app_secrets_api.managed_secret_names
}

output "aws_region" {
  description = "The AWS region resources are deployed in"
  value       = var.aws_region
}

output "api_endpoint" {
  description = "The default execute-api endpoint for the HTTP API"
  value       = aws_apigatewayv2_api.this.api_endpoint
}

output "custom_domain_url" {
  description = "The custom domain URL the API is reachable at"
  value       = "https://${var.domain_name}"
}

output "target_domain_name" {
  description = "The API Gateway target domain name to point a DNS CNAME at"
  value       = aws_apigatewayv2_domain_name.this.domain_name_configuration[0].target_domain_name
}

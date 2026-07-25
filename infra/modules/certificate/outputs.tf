output "domain_validation_options" {
  description = "The pending DNS validation records for the certificate, before validation completes"
  value       = aws_acm_certificate.this.domain_validation_options
}

output "certificate_arn" {
  description = "The ARN of the validated certificate"
  value       = aws_acm_certificate_validation.this.certificate_arn
}

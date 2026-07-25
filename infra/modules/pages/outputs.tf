output "project_name" {
  description = "The Pages project name"
  value       = cloudflare_pages_project.this.name
}

output "pages_dev_domain" {
  description = "The default <name>.pages.dev hostname, used as the DNS CNAME target"
  value       = cloudflare_pages_project.this.subdomain
}

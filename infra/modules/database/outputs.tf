output "database_url" {
  description = "The Postgres connection string for the created database"
  value       = neon_project.project.connection_uri
  sensitive   = true
}

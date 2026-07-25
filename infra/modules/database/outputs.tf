output "database_url" {
  description = "The Postgres connection string for the created database"
  value       = "postgresql://${neon_role.role.name}:${neon_role.role.password}@${neon_endpoint.endpoint.host}/${neon_database.database.name}?sslmode=require"
  sensitive   = true
}

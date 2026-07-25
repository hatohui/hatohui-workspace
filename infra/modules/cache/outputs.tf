output "database_uri" {
  description = "The URI of the created database"
  value       = "rediss://default:${upstash_redis_database.db.password}@${upstash_redis_database.db.endpoint}:${upstash_redis_database.db.port}"
  sensitive   = true
}
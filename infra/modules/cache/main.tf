resource "upstash_redis_database" "db" {
  database_name  = var.project_name
  region         = "global"
  primary_region = var.aws_region
  tls            = true
} 
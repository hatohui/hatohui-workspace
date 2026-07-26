resource "upstash_redis_database" "db" {
  # Upstash has deprecated creating plain "Regional" databases -- region =
  # "global" + primary_region is now the only supported creation path, even
  # for a single-region deployment. Leaving read_regions unset means no extra
  # cross-region replicas, which is what Upstash actually bills for.
  database_name  = var.project_name
  region         = "global"
  primary_region = var.aws_region
  tls            = true
}
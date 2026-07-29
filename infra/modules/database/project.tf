resource "neon_project" "project" {
  name      = var.project_name
  region_id = var.region_id

  history_retention_seconds = 21600

  branch {
    name          = var.branch
    database_name = var.project_name
    role_name     = var.project_name
  }
}


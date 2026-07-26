resource "neon_project" "project" {
  name = var.project_name

  # Neon Free plan caps PITR history retention at 6h (21600s); the resource's
  # own default is 1 day (86400s), which the Free plan rejects outright.
  history_retention_seconds = 21600

  # Every project auto-provisions its own default branch/database/role/
  # endpoint -- this configures that default set directly instead of
  # creating separate neon_branch/neon_database/neon_role/neon_endpoint
  # resources, which would collide with it (BRANCH_ALREADY_EXISTS).
  branch {
    name          = var.branch
    database_name = var.project_name
    role_name     = var.project_name
  }
}


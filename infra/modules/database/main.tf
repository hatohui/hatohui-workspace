resource "neon_database" "database" {
  project_id = neon_project.project.id
  branch_id  = neon_branch.branch.id
  name       = var.project_name
  owner_name = neon_role.role.name
}
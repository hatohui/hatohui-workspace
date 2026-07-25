resource "neon_role" "role" {
  project_id = neon_project.project.id
  branch_id  = neon_branch.branch.id
  name       = var.project_name
}
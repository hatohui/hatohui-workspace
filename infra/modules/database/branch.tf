resource "neon_branch" "branch" {
  project_id = neon_project.project.id
  name       = var.branch
}
resource "neon_endpoint" "endpoint" {
  project_id = neon_project.project.id
  branch_id  = neon_branch.branch.id
  type       = "read_write"
}

resource "google_project_service" "this" {
  for_each = var.enabled_services

  project = var.gcp_project
  service = each.value

  disable_on_destroy = false
}

resource "doppler_secret" "this" {
  for_each = nonsensitive(var.secrets)

  project    = var.doppler_project
  config     = var.doppler_config
  name       = each.key
  value      = each.value
  visibility = var.visibility
}

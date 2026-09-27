resource "doppler_config" "this" {
  count = var.environment == null ? 0 : 1

  project     = var.doppler_project
  environment = var.environment
  name        = var.doppler_config
}

resource "doppler_secret" "this" {
  for_each = nonsensitive(var.secrets)

  project    = var.doppler_project
  config     = var.environment == null ? var.doppler_config : doppler_config.this[0].name
  name       = each.key
  value      = each.value
  visibility = var.visibility
}

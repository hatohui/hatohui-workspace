data "doppler_secrets" "this" {
  project = var.target_doppler_project
  config  = var.target_doppler_config
}
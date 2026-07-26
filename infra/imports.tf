import {
  to = module.assets_r2.cloudflare_r2_bucket.this
  id = "${var.cloudflare_account_id}/hatohui/default"
}

locals {
  dns_zone_id = "dccc536937ecc49ecb69988a0f767524"
}

import {
  to = module.dns_zone_records.cloudflare_dns_record.this["brevo1_domainkey"]
  id = "${local.dns_zone_id}/b3927c122e2da7b3389e001930deff29"
}

import {
  to = module.dns_zone_records.cloudflare_dns_record.this["brevo2_domainkey"]
  id = "${local.dns_zone_id}/d0b9d72058486abb7b546141afd0771b"
}

import {
  to = module.dns_zone_records.cloudflare_dns_record.this["img_mail"]
  id = "${local.dns_zone_id}/58dfbe91754593087b5cee2fb5bb50e1"
}

import {
  to = module.dns_zone_records.cloudflare_dns_record.this["mail"]
  id = "${local.dns_zone_id}/2fecc04c348a86a412f7cb5d655a279e"
}

import {
  to = module.dns_zone_records.cloudflare_dns_record.this["r_mail"]
  id = "${local.dns_zone_id}/c29c286f847b5d3864b052fe31f6a56f"
}

import {
  to = module.dns_zone_records.cloudflare_dns_record.this["dmarc"]
  id = "${local.dns_zone_id}/975656163eaf868288e02a2da2dfe421"
}

import {
  to = module.dns_zone_records.cloudflare_dns_record.this["domainkey_wildcard"]
  id = "${local.dns_zone_id}/ff996e6e51c38982c237098cce52bf4b"
}

import {
  to = module.dns_zone_records.cloudflare_dns_record.this["brevo_verification"]
  id = "${local.dns_zone_id}/6eb5c160bf4143a9c9530508ea6ddc75"
}

import {
  to = module.dns_zone_records.cloudflare_dns_record.this["spf"]
  id = "${local.dns_zone_id}/7c25d4f2d8093a165175a0658d47d3f2"
}

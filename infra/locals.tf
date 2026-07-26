locals {
  dns_zone_records = {
    brevo1_domainkey = {
      name    = "brevo1._domainkey.${var.cloudflare_zone_name}"
      type    = "CNAME"
      content = "b1.hatohui-com.dkim.brevo.com"
      ttl     = 3600
    }
    brevo2_domainkey = {
      name    = "brevo2._domainkey.${var.cloudflare_zone_name}"
      type    = "CNAME"
      content = "b2.hatohui-com.dkim.brevo.com"
      ttl     = 3600
    }
    img_mail = {
      name    = "img.mail.${var.cloudflare_zone_name}"
      type    = "CNAME"
      content = "mail-hatohui-com.img.brand.brevosend.com"
      proxied = true
    }
    mail = {
      name    = "mail.${var.cloudflare_zone_name}"
      type    = "CNAME"
      content = "mail-hatohui-com.brand.brevosend.com"
      proxied = true
    }
    r_mail = {
      name    = "r.mail.${var.cloudflare_zone_name}"
      type    = "CNAME"
      content = "mail-hatohui-com.r.brand.brevosend.com"
      proxied = true
    }
    dmarc = {
      name    = "_dmarc.${var.cloudflare_zone_name}"
      type    = "TXT"
      content = "\"v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;\""
    }
    domainkey_wildcard = {
      name    = "*._domainkey.${var.cloudflare_zone_name}"
      type    = "TXT"
      content = "\"v=DKIM1; p=\""
    }
    brevo_verification = {
      name    = var.cloudflare_zone_name
      type    = "TXT"
      content = "\"brevo-code:3aa18cedd89a04d68bb66d4b4374dbfe\""
      ttl     = 3600
    }
    spf = {
      name    = var.cloudflare_zone_name
      type    = "TXT"
      content = "\"v=spf1 -all\""
    }
  }
}

locals {
  frontend_apps       = ["www", "friends", "art", "travel", "workspace"]
  frontend_dev_ports  = range(5173, 5173 + length(local.frontend_apps))
  frontend_dev_origin = { for i, app in local.frontend_apps : app => "http://localhost:${local.frontend_dev_ports[i]}" }
}

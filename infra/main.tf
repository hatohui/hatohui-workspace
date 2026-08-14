module "secrets" {
  source = "./modules/secrets"

  doppler_project = var.doppler_project
  doppler_config  = var.doppler_config
}

module "google_oauth" {
  source = "./modules/google_oauth"

  gcp_project   = var.gcp_project
  api_domain    = module.secrets.api_domain
  client_id     = var.google_oauth_client_id
  client_secret = var.google_oauth_client_secret

  web_origins = concat(
    ["https://${var.cloudflare_zone_name}"],
    [for app in local.frontend_apps : "https://${app}.${var.cloudflare_zone_name}"],
    [for app in local.frontend_apps : local.frontend_dev_origin[app]]
  )

  additional_redirect_uris = ["http://localhost:3000/auth/google/callback"]
}

module "app_secrets_api" {
  source = "./modules/app_secrets"

  doppler_project = var.doppler_project
  doppler_config  = var.api_doppler_config

  secrets = {
    GOOGLE_OAUTH_CLIENT_ID     = module.google_oauth.client_id
    GOOGLE_OAUTH_CLIENT_SECRET = module.google_oauth.client_secret
    GOOGLE_OAUTH_REDIRECT_URI  = module.google_oauth.redirect_uri
    SESSION_JWT_SECRET         = module.secrets.session_jwt_secret
    DATABASE_URL               = module.database.database_url
    REDIS_URL                  = module.cache.database_uri

    R2_BUCKET_NAME       = module.assets_r2.bucket_name
    R2_ENDPOINT          = module.assets_r2.endpoint
    R2_PUBLIC_URL        = module.assets_r2.public_url
    R2_ACCESS_KEY_ID     = module.secrets.r2_access_key_id
    R2_SECRET_ACCESS_KEY = module.secrets.r2_secret_access_key

    EMAIL_API_KEY = module.secrets.email_api_key
    ADMIN_API_KEY = module.secrets.admin_api_key
  }
}

module "cache" {
  source = "./modules/cache"

  project_name = var.project_name
  aws_region   = var.aws_region
}

module "database" {
  source = "./modules/database"

  project_name = var.project_name
}

module "ecr" {
  source = "./modules/ecr"

  repository_name = "${var.project_name}-api"
}

module "iam" {
  source = "./modules/iam"

  role_name               = "${var.project_name}-api-lambda-exec"
  github_deploy_role_name = "${var.project_name}-api-github-deploy"
  github_repository       = var.github_repository
  ecr_repository_name     = "${var.project_name}-api"
  lambda_function_name    = "${var.project_name}-api"
}

module "lambda" {
  source = "./modules/lambda"

  function_name = "${var.project_name}-api"
  image_uri     = "${module.ecr.repository_url}:${var.api_image_tag}"
  role_arn      = module.iam.lambda_role_arn

  environment_variables = {
    NODE_ENV     = "production"
    DATABASE_URL = module.database.database_url
    REDIS_URL    = module.cache.database_uri
    CORS_ORIGIN = join(",", concat(
      ["https://${var.cloudflare_zone_name}"],
      [for app in local.frontend_apps : "https://${app}.${var.cloudflare_zone_name}"],
    ))

    GOOGLE_OAUTH_CLIENT_ID     = module.google_oauth.client_id
    GOOGLE_OAUTH_CLIENT_SECRET = module.google_oauth.client_secret
    GOOGLE_OAUTH_REDIRECT_URI  = module.google_oauth.redirect_uri

    SESSION_JWT_SECRET = module.secrets.session_jwt_secret

    R2_BUCKET_NAME       = module.assets_r2.bucket_name
    R2_ENDPOINT          = module.assets_r2.endpoint
    R2_PUBLIC_URL        = module.assets_r2.public_url
    R2_ACCESS_KEY_ID     = module.secrets.r2_access_key_id
    R2_SECRET_ACCESS_KEY = module.secrets.r2_secret_access_key

    EMAIL_API_KEY = module.secrets.email_api_key
    ADMIN_API_KEY = module.secrets.admin_api_key
  }
}

module "certificate" {
  source = "./modules/certificate"

  domain_name             = module.secrets.api_domain
  validation_record_fqdns = values(module.dns_cert_validation.record_fqdns)
}

module "dns_cert_validation" {
  source = "./modules/dns"

  zone_name = var.cloudflare_zone_name
  records = {
    for dvo in module.certificate.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      type    = dvo.resource_record_type
      content = dvo.resource_record_value
    }
  }
}

module "api_gateway" {
  source = "./modules/api_gateway"

  api_name             = "${var.project_name}-api"
  domain_name          = module.secrets.api_domain
  certificate_arn      = module.certificate.certificate_arn
  lambda_function_name = module.lambda.function_name
  lambda_function_arn  = module.lambda.function_arn
  lambda_invoke_arn    = module.lambda.invoke_arn
}

module "dns_api_record" {
  source = "./modules/dns"

  zone_name = var.cloudflare_zone_name
  records = {
    (module.secrets.api_domain) = {
      name    = module.secrets.api_domain
      type    = "CNAME"
      content = module.api_gateway.target_domain_name
    }
  }
}


module "pages_friends" {
  source = "./modules/pages"

  cloudflare_account_id = var.cloudflare_account_id
  project_name          = "friends"
  domain_name           = "friends.${var.cloudflare_zone_name}"
}

module "pages_www" {
  source = "./modules/pages"

  cloudflare_account_id = var.cloudflare_account_id
  project_name          = "www"
  domain_name           = "www.${var.cloudflare_zone_name}"
}

module "dns_pages" {
  source = "./modules/dns"

  zone_name = var.cloudflare_zone_name
  records = {
    "friends.${var.cloudflare_zone_name}" = {
      name    = "friends.${var.cloudflare_zone_name}"
      type    = "CNAME"
      content = module.pages_friends.pages_dev_domain
      proxied = true
    }
    "www.${var.cloudflare_zone_name}" = {
      name    = "www.${var.cloudflare_zone_name}"
      type    = "CNAME"
      content = module.pages_www.pages_dev_domain
      proxied = true
    }
  }
}

module "dns_zone_records" {
  source = "./modules/dns"

  zone_name = var.cloudflare_zone_name
  records   = local.dns_zone_records
}

module "assets_r2" {
  source = "./modules/r2"

  cloudflare_account_id = var.cloudflare_account_id
  zone_id               = module.dns_api_record.zone_id
  bucket_name           = "hatohui"
  domain_name           = "assets.${var.cloudflare_zone_name}"
  cors_allowed_origins  = local.frontend_origins
}

module "github_ci" {
  source = "./modules/github"

  repository_name = split("/", var.github_repository)[1]
  variables = {
    AWS_REGION             = var.aws_region
    AWS_ROLE_ARN           = module.iam.github_deploy_role_arn
    ECR_REPOSITORY_URL     = module.ecr.repository_url
    LAMBDA_FUNCTION_NAME   = module.lambda.function_name
    CLOUDFLARE_ACCOUNT_ID  = var.cloudflare_account_id
    API_URL                = module.api_gateway.custom_domain_url
    GOOGLE_OAUTH_CLIENT_ID = module.google_oauth.client_id
  }

  secrets = {
    CLOUDFLARE_API_TOKEN = var.cloudflare_api_token
    DOPPLER_TOKEN        = var.doppler_token
    TF_API_TOKEN         = var.tf_api_token
    MIGRATION_DB_URL     = module.database.database_url
  }
}

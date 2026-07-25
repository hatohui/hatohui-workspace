module "secrets" {
  source = "./modules/secrets"

  target_doppler_project = var.target_doppler_project
  target_doppler_config  = var.target_doppler_config
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
    DATABASE_URL = module.database.database_url
    CORS_ORIGIN  = "https://${module.secrets.api_domain}"
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
      type    = "CNAME"
      content = module.pages_friends.pages_dev_domain
      proxied = true
    }
    "www.${var.cloudflare_zone_name}" = {
      type    = "CNAME"
      content = module.pages_www.pages_dev_domain
      proxied = true
    }
  }
}

module "assets_r2" {
  source = "./modules/r2"

  cloudflare_account_id = var.cloudflare_account_id
  zone_id               = module.dns_api_record.zone_id
  bucket_name           = "${var.project_name}-assets"
  domain_name           = "assets.${var.cloudflare_zone_name}"
}

module "github_ci" {
  source = "./modules/github"

  repository_name = split("/", var.github_repository)[1]
  variables = {
    AWS_REGION            = var.aws_region
    AWS_ROLE_ARN          = module.iam.github_deploy_role_arn
    ECR_REPOSITORY_URL    = module.ecr.repository_url
    LAMBDA_FUNCTION_NAME  = module.lambda.function_name
    CLOUDFLARE_ACCOUNT_ID = var.cloudflare_account_id
  }

  secrets = {
    CLOUDFLARE_API_TOKEN = var.cloudflare_api_token
  }
}

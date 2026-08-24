locals {
  birthday_cron_routes = {
    evaluate = "cron(0 * * * ? *)"
    process  = "cron(5 * * * ? *)"
    cleanup  = "cron(0 3 * * ? *)"
  }

  process_queue_cron_routes = {
    process = "cron(*/15 * * * ? *)"
  }
}

resource "aws_cloudwatch_event_connection" "cron" {
  name               = "${var.project_name}-cron"
  authorization_type = "API_KEY"

  auth_parameters {
    api_key {
      key   = "x-admin-key"
      value = var.admin_api_key
    }
  }
}

resource "aws_cloudwatch_event_api_destination" "birthdays" {
  for_each = local.birthday_cron_routes

  name                             = "${var.project_name}-cron-${each.key}"
  invocation_endpoint              = "https://${var.api_domain}/cron/friends/birthdays/${each.key}"
  http_method                      = "POST"
  invocation_rate_limit_per_second = 1
  connection_arn                   = aws_cloudwatch_event_connection.cron.arn
}

resource "aws_cloudwatch_event_api_destination" "process_queue" {
  for_each = local.process_queue_cron_routes

  name                             = "${var.project_name}-cron-queue-${each.key}"
  invocation_endpoint              = "https://${var.api_domain}/cron/queue/${each.key}"
  http_method                      = "POST"
  invocation_rate_limit_per_second = 1
  connection_arn                   = aws_cloudwatch_event_connection.cron.arn
}

resource "aws_iam_role" "invoke" {
  name = "${var.project_name}-cron-invoke"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "invoke" {
  name = "${var.project_name}-cron-invoke"
  role = aws_iam_role.invoke.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "events:InvokeApiDestination"
      Resource = concat(
        [for dest in aws_cloudwatch_event_api_destination.birthdays : dest.arn],
        [for dest in aws_cloudwatch_event_api_destination.process_queue : dest.arn],
      )
    }]
  })
}

resource "aws_cloudwatch_event_rule" "birthdays" {
  for_each = local.birthday_cron_routes

  name                = "${var.project_name}-cron-${each.key}"
  description         = "POST /cron/friends/birthdays/${each.key}"
  schedule_expression = each.value
}

resource "aws_cloudwatch_event_target" "birthdays" {
  for_each = local.birthday_cron_routes

  rule     = aws_cloudwatch_event_rule.birthdays[each.key].name
  arn      = aws_cloudwatch_event_api_destination.birthdays[each.key].arn
  role_arn = aws_iam_role.invoke.arn

  input = "{}"

  retry_policy {
    maximum_retry_attempts       = 3
    maximum_event_age_in_seconds = 3600
  }
}

resource "aws_cloudwatch_event_rule" "process_queue" {
  for_each = local.process_queue_cron_routes

  name                = "${var.project_name}-cron-queue-${each.key}"
  description         = "POST /cron/queue/${each.key}"
  schedule_expression = each.value
}

resource "aws_cloudwatch_event_target" "process_queue" {
  for_each = local.process_queue_cron_routes

  rule     = aws_cloudwatch_event_rule.process_queue[each.key].name
  arn      = aws_cloudwatch_event_api_destination.process_queue[each.key].arn
  role_arn = aws_iam_role.invoke.arn

  input = "{}"

  retry_policy {
    maximum_retry_attempts       = 3
    maximum_event_age_in_seconds = 3600
  }
}

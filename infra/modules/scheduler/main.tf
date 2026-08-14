locals {
  # Mirrors the cronjob.com setup this replaces: evaluate hourly, process a
  # few minutes after (so queued rows are already written), cleanup daily.
  birthday_cron_routes = {
    evaluate = "rate(1 hour)"
    process  = "cron(5 * * * ? *)"
    cleanup  = "cron(0 3 * * ? *)"
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

resource "aws_iam_role" "scheduler" {
  name = "${var.project_name}-cron-scheduler"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "scheduler.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "scheduler_invoke" {
  name = "${var.project_name}-cron-invoke"
  role = aws_iam_role.scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "events:InvokeApiDestination"
      Resource = [for dest in aws_cloudwatch_event_api_destination.birthdays : dest.arn]
    }]
  })
}

resource "aws_scheduler_schedule" "birthdays" {
  for_each = local.birthday_cron_routes

  name       = "${var.project_name}-cron-${each.key}"
  group_name = "default"

  schedule_expression = each.value

  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = aws_cloudwatch_event_api_destination.birthdays[each.key].arn
    role_arn = aws_iam_role.scheduler.arn

    retry_policy {
      maximum_retry_attempts = 3
    }
  }
}

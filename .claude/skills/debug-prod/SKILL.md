---
name: debug-prod
description: Triage production issues in hatohui-workspace's AWS Lambda + Doppler infra. Use when asked to debug prod, check why the API is down, investigate a 500 error, look at CloudWatch logs, or diagnose api.hatohui.com.
---

Production is one NestJS API (`hatohui-workspace-api`) running as a
Lambda-image function behind API Gateway, backed by Neon Postgres. There's
no local AWS CLI login by default — credentials come from Doppler.

## 1. Get AWS credentials (from Doppler, not disk)

```bash
mcp__doppler__secrets_list  project=hatohui-workspace  config=tf
```

Pull `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` from the
result. Export them **for the current shell only** — never write them to a
file, never echo them back into chat text:

```bash
export AWS_ACCESS_KEY_ID="<from doppler>"
export AWS_SECRET_ACCESS_KEY="<from doppler>"
export AWS_DEFAULT_REGION="<from doppler, e.g. ap-southeast-1>"
aws sts get-caller-identity   # sanity check — should return an Account/Arn, not InvalidClientTokenId
```

## 2. Windows/git-bash gotcha

MSYS path conversion mangles any leading-slash argument (CloudWatch log
group names look like `/aws/lambda/...`) into a Windows path, which makes
`aws logs` calls fail with a cryptic `InvalidParameterException` about the
log group name not matching its regex. Always set this first on Windows:

```bash
export MSYS_NO_PATHCONV=1
```

## 3. Find the real error

Start with the function's own state — this catches deploy-level failures
(bad image, stuck update) before you go log-diving:

```bash
aws lambda get-function --function-name hatohui-workspace-api \
  --query "Configuration.[State,LastUpdateStatus,LastUpdateStatusReason]"

aws lambda get-function --function-name hatohui-workspace-api \
  --query "Code.ImageUri"   # confirm it's the tag you expect (usually :latest)
```

If that looks fine (`Active`/`Successful`), the failure is at invoke/boot
time — read the actual stack trace from CloudWatch:

```bash
aws logs describe-log-streams \
  --log-group-name "/aws/lambda/hatohui-workspace-api" \
  --order-by LastEventTime --descending --max-items 3 \
  --query "logStreams[].logStreamName"

# pick the newest stream from the output above, then:
aws logs get-log-events \
  --log-group-name "/aws/lambda/hatohui-workspace-api" \
  --log-stream-name '<stream-name-from-above>' \
  --limit 100 --query "events[].message"
```

Read every line — the useful part (a `ZodError`, a Prisma error code, a
stack trace) is usually mixed in with generic `INIT_REPORT`/`START`/`END`
noise.

## 4. Common root causes, roughly in likelihood order

1. **Missing/renamed env var.** The app validates its full env schema
   (`apps/api/src/config/env.ts`, zod) on every cold start — a var required
   there but not set on the live Lambda crashes every single invocation
   with a `ZodError`, consistently, in ~3-4s (not a real cold-start compute
   delay — the process exits before it can even bind a port). Compare:
   ```bash
   aws lambda get-function-configuration --function-name hatohui-workspace-api \
     --query "Environment.Variables"
   ```
   against what `env.ts` currently requires. Fix: wire the var through
   `infra/main.tf`'s `module.lambda.environment_variables` (see
   `/implement-feature` step 5), `terraform plan`, confirm, `apply`.

2. **Prisma migrations never applied to prod.** Symptom: a specific
   endpoint 500s with `PrismaClientKnownRequestError` / code `P2021`,
   `relation "public.<Table>" does not exist` in the logs — while other
   endpoints work fine. This can be true even for tables that have existed
   in `schema.prisma` for a long time if `migrate deploy` was simply never
   run against that particular database. Fix:
   ```bash
   task db:prod:apply
   ```
   (sources `DATABASE_URL` from Doppler's `prod_api` config; if that config
   doesn't have `DATABASE_URL` yet, it needs mirroring via
   `module.app_secrets_api` first — see `/implement-feature` step 5.)

3. **Stale/pinned image tag.** `api-cd.yml` tags images with both the
   commit SHA and `:latest`; the Lambda's `image_uri` in
   `infra/modules/lambda/main.tf` follows `var.api_image_tag` (defaults to
   `latest`). If it's pinned to a one-off SHA (e.g. from a manual
   `-target` apply), a `terraform plan` will show it flipping back to
   `:latest` — that's expected, not a problem, once other fixes are ready
   to apply together.

4. **Google OAuth origin/redirect mismatches** — `Error 400: origin_mismatch`
   or similar from Google's side, not from our API at all. Terraform
   **cannot** manage this (Google exposes no API for a Web OAuth client's
   Authorized JavaScript origins/redirect URIs — `infra/modules/google_oauth`
   only computes the *intended* list as an output). Get the intended list:
   ```bash
   cd infra
   doppler run --token "<tf-config-doppler-token>" --project hatohui-workspace \
     --config tf --name-transformer tf-var -- terraform output -json \
     | grep -A20 google_oauth
   ```
   Then a human pastes the missing origin(s)/URI(s) into
   [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
   on the matching Web client. This is the one step in the whole pipeline
   that cannot be automated.

## 5. Before proposing any fix

- **Distinguish "caused by this session's change" from "pre-existing
  drift."** A `terraform plan` run mid-incident will often surface
  unrelated diffs (DNS record normalization, a Cloudflare Pages project's
  `source` block going missing because someone disconnected it in the
  dashboard) — call these out explicitly and leave them alone rather than
  silently applying everything the plan shows.
- **Never mutate live AWS resources or run `terraform apply` without
  explicit user confirmation** — even mid-outage. State the exact command
  you intend to run and what it changes; a few seconds of confirmation is
  cheap next to an unintended change to a resource nobody asked to touch.
- Prefer `terraform apply -target=<specific module>` over a full apply when
  you only need to land one fix, so unrelated drift doesn't get swept in.

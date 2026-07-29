import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// Vars that hit a *real* external API and therefore need the actual
// credential — everything else (DATABASE_URL, REDIS_URL, R2_*, ...) stays
// pointed at local infra (docker-compose) via .env.example's defaults.
const DOPPLER_SOURCED_VARS = ['GOOGLE_OAUTH_CLIENT_ID', 'EMAIL_API_KEY'];
const DOPPLER_PROJECT = 'hatohui-workspace';
const DOPPLER_CONFIG = 'tf';

const envPath = resolve(import.meta.dirname, '../apps/api/.env');

function fetchDopplerSecrets(names: string[]): Record<string, string> {
  const result = spawnSync(
    'doppler',
    [
      'secrets',
      'get',
      ...names,
      '--project',
      DOPPLER_PROJECT,
      '--config',
      DOPPLER_CONFIG,
      '--json',
    ],
    { encoding: 'utf-8' },
  );

  if (result.status !== 0) {
    process.stderr.write(
      `Failed to fetch secrets from Doppler (is the CLI installed and authenticated? \`doppler login\`):\n${result.stderr}`,
    );
    process.exit(result.status ?? 1);
  }

  const parsed = JSON.parse(result.stdout) as Record<
    string,
    { computed: string }
  >;
  return Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [key, value.computed]),
  );
}

function upsertEnvVars(contents: string, vars: Record<string, string>): string {
  let next = contents;
  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    next = pattern.test(next) ? next.replace(pattern, line) : `${next}\n${line}`;
  }
  return next;
}

const secrets = fetchDopplerSecrets(DOPPLER_SOURCED_VARS);

let contents = readFileSync(envPath, 'utf-8');
contents = upsertEnvVars(contents, secrets);

// SESSION_JWT_SECRET is deliberately *not* sourced from Doppler — local and
// prod should use different values. Generate one locally if missing/empty.
if (!/^SESSION_JWT_SECRET=.+$/m.test(contents)) {
  contents = upsertEnvVars(contents, {
    SESSION_JWT_SECRET: randomBytes(32).toString('hex'),
  });
}

writeFileSync(envPath, contents);
process.stdout.write(
  `Synced ${DOPPLER_SOURCED_VARS.join(', ')} from Doppler (${DOPPLER_PROJECT}/${DOPPLER_CONFIG}) into apps/api/.env, and ensured a local SESSION_JWT_SECRET.\n`,
);

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const apiDir = resolve(import.meta.dirname, '../apps/api');
const outFile = resolve(import.meta.dirname, '../packages/models/openapi.json');

const result = spawnSync('bun', ['run', 'print-openapi'], {
  cwd: apiDir,
  encoding: 'utf-8',
});

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

writeFileSync(outFile, result.stdout);

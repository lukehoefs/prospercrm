#!/usr/bin/env node
/**
 * Dumps the schema of a Twenty workspace: every object and its fields.
 *
 * Twenty has no built-in "Lead" object — workspaces model leads as People
 * with a stage field, as Opportunities, or as a custom object, usually with
 * custom fields on top. This prints what actually exists so the integration
 * is built against the real schema instead of a guess.
 *
 * Usage:
 *   node scripts/twenty-introspect.mjs            # summary
 *   node scripts/twenty-introspect.mjs --json     # full JSON
 *
 * Reads TWENTY_BASE_URL and TWENTY_API_KEY from .env.local (or the
 * environment). Nothing is written to disk and no record data is fetched —
 * only schema metadata.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function loadEnvLocal() {
  const env = {};
  try {
    const raw = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    // No .env.local — fall back to the ambient environment.
  }
  return env;
}

const fileEnv = loadEnvLocal();
const baseUrl = (process.env.TWENTY_BASE_URL || fileEnv.TWENTY_BASE_URL || '').replace(/\/+$/, '');
const apiKey = process.env.TWENTY_API_KEY || fileEnv.TWENTY_API_KEY || '';

if (!baseUrl || !apiKey) {
  console.error('Missing TWENTY_BASE_URL or TWENTY_API_KEY (set them in .env.local).');
  process.exit(1);
}

const asJson = process.argv.includes('--json');

async function get(path) {
  const url = `${baseUrl}${path}`;
  let response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    });
  } catch (cause) {
    console.error(`\nCould not reach ${baseUrl}`);
    console.error(`  ${cause.message}`);
    console.error('\nCheck that the instance is up and reachable from this machine.');
    process.exit(1);
  }

  const text = await response.text();
  if (!response.ok) {
    console.error(`\nHTTP ${response.status} on ${path}`);
    console.error(text.slice(0, 800));
    if (response.status === 401 || response.status === 403) {
      console.error('\nThe API key was rejected. Generate a new one in Twenty:');
      console.error('  Settings -> APIs & Webhooks -> Create API key');
    }
    process.exit(1);
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error(`\nExpected JSON from ${path}, received:\n${text.slice(0, 400)}`);
    console.error('\nIs TWENTY_BASE_URL pointing at the Twenty API and not a login page?');
    process.exit(1);
  }
}

const payload = await get('/rest/metadata/objects?limit=100');
const objects = payload?.data?.objects ?? payload?.data ?? [];

if (asJson) {
  console.log(JSON.stringify(objects, null, 2));
  process.exit(0);
}

console.log(`\nWorkspace schema at ${baseUrl}`);
console.log(`${objects.length} objects\n`);

for (const object of objects) {
  if (object.isSystem) continue;

  const fields = object.fields?.edges?.map((edge) => edge.node) ?? object.fields ?? [];
  const flags = [
    object.isCustom ? 'custom' : 'standard',
    object.isActive === false ? 'inactive' : null,
  ]
    .filter(Boolean)
    .join(', ');

  console.log(`${object.nameSingular}  (${object.namePlural})  [${flags}]`);
  if (object.labelSingular && object.labelSingular !== object.nameSingular) {
    console.log(`  label: ${object.labelSingular}`);
  }

  for (const field of fields) {
    if (field.isSystem) continue;
    const options = field.options?.map((option) => option.value).join(' | ');
    console.log(
      `    ${(field.name ?? '?').padEnd(28)} ${(field.type ?? '?').padEnd(14)}` +
        (options ? ` ${options}` : ''),
    );
  }
  console.log('');
}

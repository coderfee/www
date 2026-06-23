import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_WEREAD_OPTIONS = {
  apiBaseEnv: 'API_BASE',
  apiTokenEnv: 'API_TOKEN',
  outputFile: 'public/data/weread.json',
  modes: ['weekly', 'monthly', 'annually', 'overall'],
};

export function resolveWereadOptions(options = {}) {
  return {
    ...DEFAULT_WEREAD_OPTIONS,
    ...options,
    modes: options.modes ?? DEFAULT_WEREAD_OPTIONS.modes,
  };
}

export async function syncWereadData(options = {}) {
  const config = resolveWereadOptions(options);
  const entries = await Promise.all(config.modes.map(async (mode) => [mode, await fetchMode(config, mode)]));
  const outputFile = resolveOutputFile(config.outputFile);
  const payload = {
    updatedAt: new Date().toISOString(),
    data: Object.fromEntries(entries),
  };

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`);

  return {
    outputFile: path.relative(process.cwd(), outputFile),
    modes: config.modes,
  };
}

async function fetchMode(config, mode) {
  const url = new URL('/api/weread/readdata', getRequiredEnv(config.apiBaseEnv));
  url.searchParams.set('mode', mode);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getRequiredEnv(config.apiTokenEnv)}`,
      'x-build-client': 'coderfee.com',
    },
  });

  if (!response.ok) {
    throw new Error(`fetch WeRead ${mode} failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || `fetch WeRead ${mode} failed`);
  }

  return payload.data?.summary ?? null;
}

function resolveOutputFile(outputFile) {
  return path.isAbsolute(outputFile) ? outputFile : path.join(process.cwd(), outputFile);
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

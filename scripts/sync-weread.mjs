import { promises as fs } from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const MODES = ['weekly', 'monthly', 'annually', 'overall'];
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/weread-readdata.json');
const EMPTY_DATA = Object.fromEntries(MODES.map((mode) => [mode, null]));

async function fetchReadData(mode) {
  const url = new URL('/api/weread/readdata', process.env.API_BASE);
  url.searchParams.set('mode', mode);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      'x-build-client': 'coderfee.com',
    },
  });

  if (!response.ok) {
    throw new Error(`fetch ${mode} failed: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || `fetch ${mode} failed`);
  }

  return json.data.summary;
}

async function writeData(data) {
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(
    OUTPUT_PATH,
    `${JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        data,
      },
      null,
      2,
    )}\n`,
  );
}

async function ensureDataFile() {
  try {
    await fs.access(OUTPUT_PATH);
  } catch {
    await writeData(EMPTY_DATA);
  }
}

async function main() {
  console.log('📚 Syncing WeRead stats...');

  if (!process.env.API_BASE || !process.env.API_TOKEN) {
    await ensureDataFile();
    console.log('   - API env vars are empty. Existing data file is ready.');
    return;
  }

  const entries = await Promise.all(MODES.map(async (mode) => [mode, await fetchReadData(mode)]));
  await writeData(Object.fromEntries(entries));

  console.log('✅ WeRead stats synced.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

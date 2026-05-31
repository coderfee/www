import 'dotenv/config';
import { syncRemoteContent } from './content-sync.mjs';

async function main() {
  console.log('Starting remote content sync.');
  await syncRemoteContent();
  console.log('Remote content sync complete.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

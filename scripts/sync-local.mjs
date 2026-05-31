import 'dotenv/config';
import { syncLocalBlog } from './content-sync.mjs';

async function main() {
  console.log('Starting local content sync.');
  await syncLocalBlog();
  console.log('Local content sync complete.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

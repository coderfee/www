import { promises as fs } from 'node:fs';
import path from 'node:path';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const CONTENT_DIR = path.join(process.cwd(), 'src/content/newsletter');
const R2_PREFIX = 'Newsletter/';

async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

async function getLocalFiles(dir) {
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.join(dir, dirent.name);
        return dirent.isDirectory() ? getLocalFiles(res) : res;
      }),
    );
    return files.flat();
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function syncR2() {
  console.log('🚀 Starting sync with Cloudflare R2...');

  const listedObjects = await R2.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: R2_PREFIX,
    }),
  );

  const remoteFiles = listedObjects.Contents?.filter((item) => item.Key && !item.Key.endsWith('/')) || [];
  const remoteFileCount = remoteFiles.length;

  const localMdxFiles = (await getLocalFiles(CONTENT_DIR)).filter((file) => file.endsWith('.mdx'));
  const localFileCount = localMdxFiles.length;

  console.log(`   - Found ${remoteFileCount} files in R2.`);
  console.log(`   - Found ${localFileCount} local files.`);

  if (remoteFileCount === localFileCount) {
    console.log('✅ File counts match. No sync needed.');
    return;
  }

  console.log('   - File counts differ. Starting download...');
  await fs.mkdir(CONTENT_DIR, { recursive: true });

  for (const item of remoteFiles) {
    const relativePath = item.Key.substring(R2_PREFIX.length);
    if (!relativePath) continue;

    const newRelativePath = relativePath.replace(/\.md$/, '.mdx');
    const localPath = path.join(CONTENT_DIR, newRelativePath);
    const localDir = path.dirname(localPath);

    await fs.mkdir(localDir, { recursive: true });

    console.log(`   - Downloading ${item.Key} to ${newRelativePath}...`);

    const object = await R2.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key }));
    const content = await streamToString(object.Body);

    await fs.writeFile(localPath, content);
  }

  console.log('✅ Sync with R2 complete.');
}

syncR2().catch(console.error);

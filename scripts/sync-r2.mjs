import { promises as fs } from 'node:fs';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import path from 'node:path';
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

async function syncR2() {
  console.log('🚀 Starting sync with Cloudflare R2...');

  await fs.mkdir(CONTENT_DIR, { recursive: true });

  const listedObjects = await R2.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: R2_PREFIX,
    }),
  );

  if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
    console.log('✅ No objects found in R2. Sync complete.');
    return;
  }

  for (const item of listedObjects.Contents) {
    if (!item.Key || item.Key.endsWith('/')) continue;

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

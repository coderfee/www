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
const R2_PREFIX = '03-明日周刊/';
const PROJECT_CONTENT_DIR = path.join(process.cwd(), 'src/content/newsletter');

const CACHE_DIR = '/tmp/newsletters';

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

async function getRemoteFiles() {
  const listedObjects = await R2.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: R2_PREFIX,
    }),
  );
  return listedObjects.Contents?.filter((item) => item.Key && !item.Key.endsWith('/')) || [];
}

async function syncR2ToCache(remoteFiles, cachedFiles) {
  const remoteFileCount = remoteFiles.length;
  const localFileCount = cachedFiles.length;

  console.log(`   - Found ${remoteFileCount} files in R2.`);
  console.log(`   - Found ${localFileCount} cached files.`);

  if (remoteFileCount === localFileCount) {
    console.log('✅ Cache is up to date. No sync needed.');
    return;
  }

  console.log('   - Cache is outdated. Starting download...');
  await fs.mkdir(CACHE_DIR, { recursive: true });

  for (const item of remoteFiles) {
    const relativePath = item.Key.substring(R2_PREFIX.length);
    if (!relativePath) continue;

    const newRelativePath = relativePath.replace(/\.md$/, '.mdx');
    const localPath = path.join(CACHE_DIR, newRelativePath);
    const localDir = path.dirname(localPath);

    await fs.mkdir(localDir, { recursive: true });

    console.log(`   - Downloading ${item.Key} to cache...`);

    const object = await R2.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key }));
    const content = await streamToString(object.Body);

    await fs.writeFile(localPath, content);
  }
  console.log('✅ Cache sync complete.');
}

async function copyFiles(sourceDir, destDir) {
  await fs.rm(destDir, { recursive: true, force: true });
  await fs.mkdir(destDir, { recursive: true });
  const filesToCopy = await getLocalFiles(sourceDir);
  for (const file of filesToCopy) {
    const relativePath = path.relative(sourceDir, file);
    const destPath = path.join(destDir, relativePath);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(file, destPath);
  }
}

async function main() {
  console.log('🚀 Starting sync with Cloudflare R2...');

  await fs.mkdir(CACHE_DIR, { recursive: true });

  const remoteFiles = await getRemoteFiles();
  const cachedFiles = (await getLocalFiles(CACHE_DIR)).filter((file) => file.endsWith('.mdx'));

  await syncR2ToCache(remoteFiles, cachedFiles);

  console.log('   - Copying files to project directory...');
  await copyFiles(CACHE_DIR, PROJECT_CONTENT_DIR);

  console.log('✅ Sync complete.');
}

main().catch(console.error);

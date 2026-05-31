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

const COLLECTIONS = [
  {
    name: 'newsletter',
    prefix: '03 Newsletter/',
    cacheDir: '/tmp/newsletters',
    outputDir: path.join(process.cwd(), 'src/content/newsletter'),
    transform: transformNewsletter,
  },
  {
    name: 'blog',
    prefix: '02 Writing/03 Blog/',
    cacheDir: '/tmp/blog-posts',
    outputDir: path.join(process.cwd(), 'src/content/blog'),
    transform: transformBlog,
    keepOutputWhenRemoteEmpty: true,
  },
];

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

async function getRemoteFiles(prefix) {
  const objects = [];
  let continuationToken;

  do {
    const listedObjects = await R2.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    objects.push(...(listedObjects.Contents || []).filter((item) => item.Key && !item.Key.endsWith('/')));
    continuationToken = listedObjects.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

async function syncR2ToCache(collection, remoteFiles) {
  const manifestPath = path.join(collection.cacheDir, '.manifest.json');
  const currentManifest = Object.fromEntries(
    remoteFiles.map((item) => [
      item.Key,
      {
        etag: item.ETag,
        lastModified: item.LastModified?.toISOString(),
        size: item.Size,
      },
    ]),
  );

  const previousManifest = await readJson(manifestPath);

  if (JSON.stringify(previousManifest) === JSON.stringify(currentManifest)) {
    console.log(`   - ${collection.name}: cache is up to date.`);
    return;
  }

  console.log(`   - ${collection.name}: downloading ${remoteFiles.length} files.`);
  await fs.rm(collection.cacheDir, { recursive: true, force: true });
  await fs.mkdir(collection.cacheDir, { recursive: true });

  for (const item of remoteFiles) {
    const relativePath = item.Key.slice(collection.prefix.length);
    const localPath = path.join(collection.cacheDir, relativePath);

    await fs.mkdir(path.dirname(localPath), { recursive: true });

    const object = await R2.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key }));
    const content = await streamToString(object.Body);

    await fs.writeFile(localPath, content);
  }

  await fs.writeFile(manifestPath, JSON.stringify(currentManifest, null, 2));
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeOutput(outputDir, files) {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const file of files) {
    const outputPath = path.join(outputDir, file.path);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, file.content);
  }
}

async function transformNewsletter(collection) {
  const sourceFiles = (await getLocalFiles(collection.cacheDir)).filter((file) => /\.(md|mdx)$/.test(file));

  return Promise.all(
    sourceFiles.map(async (file) => ({
      path: `${path.basename(file, path.extname(file))}.mdx`,
      content: await fs.readFile(file, 'utf8'),
    })),
  );
}

async function transformBlog(collection) {
  const sourceFiles = (await getLocalFiles(collection.cacheDir)).filter((file) => /\.(md|mdx)$/.test(file));
  const outputFiles = [];
  const seenSlugs = new Set();

  for (const file of sourceFiles) {
    const article = parseFrontmatter(await fs.readFile(file, 'utf8'));

    if (!shouldPublishBlogPost(article.data)) {
      continue;
    }

    if (!article.data.slug) {
      throw new Error(`Blog source is missing slug: ${file}`);
    }

    if (seenSlugs.has(article.data.slug)) {
      throw new Error(`Duplicate blog slug "${article.data.slug}" in ${file}`);
    }

    seenSlugs.add(article.data.slug);

    const data = normalizeBlogFrontmatter(article.data);

    outputFiles.push({
      path: `${flattenSlug(article.data.slug)}.md`,
      content: `${formatFrontmatter(data)}${article.body.trimStart()}`,
    });
  }

  return outputFiles.sort((a, b) => a.path.localeCompare(b.path));
}

function flattenSlug(slug) {
  return slug.replaceAll('/', '--');
}

function shouldPublishBlogPost(data) {
  if (data.draft === true) {
    return false;
  }

  const channels = Array.isArray(data.channels) ? data.channels : [];
  const isBlogPost = channels.length === 0 || channels.includes('博客');
  const isDone = !data.status || data.status === '已完成';

  return isBlogPost && isDone;
}

function normalizeBlogFrontmatter(data) {
  return {
    title: data.title,
    slug: data.slug,
    date: data.date,
    tldr: data.tldr,
    tags: (data.tags || []).map(String).filter((tag) => !tag.startsWith('Area/') && !tag.startsWith('Type/')),
    keywords: data.keywords?.map(String),
    heroImage: data.heroImage,
    cover: data.cover,
    draft: data.draft,
  };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { data: {}, body: content };
  }

  return {
    data: parseYaml(match[1]),
    body: content.slice(match[0].length),
  };
}

function parseYaml(yaml) {
  const data = {};
  const lines = yaml.split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) {
      continue;
    }

    const [, key, rawValue] = pair;
    if (rawValue === '') {
      const values = [];
      while (index + 1 < lines.length && /^\s+-\s+/.test(lines[index + 1])) {
        index += 1;
        values.push(cleanScalar(lines[index].replace(/^\s+-\s+/, '')));
      }
      data[key] = values;
      continue;
    }

    data[key] = cleanScalar(rawValue);
  }

  return data;
}

function cleanScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (/^\[.*\]$/.test(trimmed)) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => cleanScalar(item))
      .filter((item) => item !== '');
  }
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function formatFrontmatter(data) {
  const lines = ['---'];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }

      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${formatYamlValue(item)}`);
      }
      continue;
    }

    lines.push(`${key}: ${formatYamlValue(value)}`);
  }

  lines.push('---');
  return `${lines.join('\n')}\n\n`;
}

function formatYamlValue(value) {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  return value;
}

async function syncCollection(collection) {
  console.log(`- Syncing ${collection.name} from R2 prefix "${collection.prefix}"`);

  await fs.mkdir(collection.cacheDir, { recursive: true });

  const remoteFiles = await getRemoteFiles(collection.prefix);
  console.log(`   - ${collection.name}: found ${remoteFiles.length} files in R2.`);

  if (remoteFiles.length === 0 && collection.keepOutputWhenRemoteEmpty) {
    console.log(`   - ${collection.name}: remote is empty, keeping existing output.`);
    return;
  }

  await syncR2ToCache(collection, remoteFiles);

  const outputFiles = await collection.transform(collection);
  await writeOutput(collection.outputDir, outputFiles);

  console.log(`   - ${collection.name}: wrote ${outputFiles.length} files.`);
}

async function main() {
  console.log('Starting sync with Cloudflare R2.');

  for (const collection of COLLECTIONS) {
    await syncCollection(collection);
  }

  console.log('R2 sync complete.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

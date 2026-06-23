import { promises as fs } from 'node:fs';
import path from 'node:path';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

export const DEFAULT_REMOTE_CONTENT_OPTIONS = {
  local: {
    blogDir: '/Users/chen/Obsidian/notes/02 Writing/03 Blog',
    newsletterDir: '/Users/chen/Obsidian/notes/03 Newsletter',
  },
  remote: {
    blogPrefix: '02 Writing/03 Blog/',
    newsletterPrefix: '03 Newsletter/',
  },
  output: {
    blogDir: 'src/content/blog',
    newsletterDir: 'src/content/newsletter',
  },
  r2: {
    accountIdEnv: 'R2_ACCOUNT_ID',
    accessKeyIdEnv: 'R2_ACCESS_KEY_ID',
    secretAccessKeyEnv: 'R2_SECRET_ACCESS_KEY',
    bucketName: 'obsidian',
  },
};

export function resolveRemoteContentOptions(options = {}) {
  return {
    local: {
      ...DEFAULT_REMOTE_CONTENT_OPTIONS.local,
      ...options.local,
    },
    remote: {
      ...DEFAULT_REMOTE_CONTENT_OPTIONS.remote,
      ...options.remote,
    },
    output: {
      ...DEFAULT_REMOTE_CONTENT_OPTIONS.output,
      ...options.output,
    },
    r2: {
      ...DEFAULT_REMOTE_CONTENT_OPTIONS.r2,
      ...options.r2,
    },
  };
}

export async function syncLocalContent(options = {}) {
  const config = resolveRemoteContentOptions(options);
  const newsletter = await syncLocalCollection({
    name: 'newsletter',
    sourceDir: config.local.newsletterDir,
    outputDir: resolveOutputDir(config.output.newsletterDir),
    transform: transformNewsletterSources,
  });

  const blog = await syncLocalCollection({
    name: 'blog',
    sourceDir: config.local.blogDir,
    outputDir: resolveOutputDir(config.output.blogDir),
    transform: transformBlogFiles,
  });

  return { newsletter, blog };
}

async function syncLocalCollection(collection) {
  console.log(`- Syncing ${collection.name} from local source "${collection.sourceDir}"`);

  const sourceFiles = (await getLocalFiles(collection.sourceDir))
    .filter((file) => /\.(md|mdx)$/.test(file))
    .map(async (file) => ({
      key: file,
      relativePath: path.relative(collection.sourceDir, file),
      content: await fs.readFile(file, 'utf8'),
    }));
  const outputFiles = await collection.transform(await Promise.all(sourceFiles));
  await writeOutput(collection.outputDir, outputFiles);

  console.log(`   - ${collection.name}: wrote ${outputFiles.length} files.`);

  return {
    name: collection.name,
    source: collection.sourceDir,
    sourceFiles: outputFiles.length,
    outputFiles: outputFiles.length,
  };
}

export async function syncRemoteContent(options = {}) {
  const config = resolveRemoteContentOptions(options);
  const newsletter = await syncRemoteCollection({
    name: 'newsletter',
    prefix: config.remote.newsletterPrefix,
    outputDir: resolveOutputDir(config.output.newsletterDir),
    transform: transformNewsletterSources,
    r2: config.r2,
  });

  const blog = await syncRemoteCollection({
    name: 'blog',
    prefix: config.remote.blogPrefix,
    outputDir: resolveOutputDir(config.output.blogDir),
    transform: transformBlogFiles,
    r2: config.r2,
  });

  return { newsletter, blog };
}

function resolveOutputDir(outputDir) {
  return path.isAbsolute(outputDir) ? outputDir : path.join(process.cwd(), outputDir);
}

async function fetchContentObject(key, r2) {
  const response = await getR2Client(r2).send(
    new GetObjectCommand({
      Bucket: getR2BucketName(r2),
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`fetch content object failed: ${key}: empty body`);
  }

  return response.Body.transformToString();
}

async function listR2Objects(prefix, r2) {
  const objects = [];
  let continuationToken;

  do {
    const response = await getR2Client(r2).send(
      new ListObjectsV2Command({
        Bucket: getR2BucketName(r2),
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    objects.push(
      ...(response.Contents ?? []).map((object) => ({
        key: object.Key,
        etag: object.ETag?.replaceAll('"', ''),
        lastModified: object.LastModified?.toISOString(),
        size: object.Size,
      })),
    );

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return objects;
}

const r2Clients = new Map();

function getR2Client(r2) {
  const clientKey = JSON.stringify(r2);
  const cachedClient = r2Clients.get(clientKey);
  if (cachedClient) {
    return cachedClient;
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${getRequiredEnv(r2.accountIdEnv)}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getRequiredEnv(r2.accessKeyIdEnv),
      secretAccessKey: getRequiredEnv(r2.secretAccessKeyEnv),
    },
  });
  r2Clients.set(clientKey, client);

  return client;
}

function getR2BucketName(r2) {
  if (!r2.bucketName) {
    throw new Error('Missing r2.bucketName');
  }

  return r2.bucketName;
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

async function syncRemoteCollection(collection) {
  console.log(`- Syncing ${collection.name} from R2 prefix "${collection.prefix}"`);

  const remoteFiles = (await listR2Objects(collection.prefix, collection.r2)).filter(
    (item) => item.key && /\.(md|mdx)$/.test(item.key),
  );
  console.log(`   - ${collection.name}: found ${remoteFiles.length} files.`);

  if (remoteFiles.length === 0) {
    throw new Error(`${collection.name} R2 prefix is empty: ${collection.prefix}`);
  }

  const sourceFiles = await Promise.all(
    remoteFiles.map(async (item) => ({
      key: item.key,
      relativePath: item.key.slice(collection.prefix.length),
      content: await fetchContentObject(item.key, collection.r2),
    })),
  );
  const outputFiles = await collection.transform(sourceFiles);
  await writeOutput(collection.outputDir, outputFiles);

  console.log(`   - ${collection.name}: wrote ${outputFiles.length} files.`);

  return {
    name: collection.name,
    prefix: collection.prefix,
    remoteFiles: remoteFiles.length,
    outputFiles: outputFiles.length,
  };
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
      throw new Error(`Source directory does not exist: ${dir}`);
    }
    throw error;
  }
}

async function transformNewsletterSources(sourceFiles) {
  return sourceFiles
    .map((file) => ({
      path: `${path.basename(file.relativePath, path.extname(file.relativePath))}.mdx`,
      content: file.content,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

async function transformBlogFiles(sourceFiles) {
  const outputFiles = [];
  const seenSlugs = new Set();

  for (const file of sourceFiles) {
    const article = parseFrontmatter(file.content);

    if (!shouldPublishBlogPost(article.data)) {
      continue;
    }

    assertRequiredBlogFields(article.data, file.key);

    if (seenSlugs.has(article.data.slug)) {
      throw new Error(`Duplicate blog slug "${article.data.slug}" in ${file.key}`);
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

function assertRequiredBlogFields(data, file) {
  const missingFields = ['title', 'slug', 'date', 'tldr'].filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new Error(`Blog source is missing ${missingFields.join(', ')}: ${file}`);
  }
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
    tags: normalizeTags(data.tags),
    keywords: normalizeArray(data.keywords),
    heroImage: data.heroImage,
    cover: data.cover,
    draft: data.draft,
  };
}

function normalizeTags(tags) {
  return normalizeArray(tags)?.filter((tag) => !tag.startsWith('Area/') && !tag.startsWith('Type/'));
}

function normalizeArray(value) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.map(String).filter(Boolean);
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

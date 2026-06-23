import { promises as fs } from 'node:fs';
import path from 'node:path';

export const BLOG_SOURCE_DIR = '/Users/chen/Obsidian/notes/02 Writing/03 Blog';
export const BLOG_R2_PREFIX = '02 Writing/03 Blog/';
export const NEWSLETTER_R2_PREFIX = '03 Newsletter/';

export const BLOG_OUTPUT_DIR = path.join(process.cwd(), 'src/content/blog');
export const NEWSLETTER_OUTPUT_DIR = path.join(process.cwd(), 'src/content/newsletter');

export async function syncLocalBlog() {
  console.log(`- Syncing blog from local source "${BLOG_SOURCE_DIR}"`);

  const outputFiles = await transformBlog(BLOG_SOURCE_DIR);
  await writeOutput(BLOG_OUTPUT_DIR, outputFiles);

  console.log(`   - blog: wrote ${outputFiles.length} files.`);

  return {
    blog: {
      source: BLOG_SOURCE_DIR,
      sourceFiles: outputFiles.length,
      outputFiles: outputFiles.length,
    },
  };
}

export async function syncRemoteContent() {
  const manifest = await fetchContentManifest();

  const newsletter = await syncManifestCollection({
    name: 'newsletter',
    prefix: NEWSLETTER_R2_PREFIX,
    cacheDir: '/tmp/newsletters',
    outputDir: NEWSLETTER_OUTPUT_DIR,
    transform: transformNewsletter,
    remoteFiles: manifest.collections?.newsletter ?? [],
  });

  const blog = await syncManifestCollection({
    name: 'blog',
    prefix: BLOG_R2_PREFIX,
    cacheDir: '/tmp/blog-posts',
    outputDir: BLOG_OUTPUT_DIR,
    transform: transformBlog,
    remoteFiles: manifest.collections?.blog ?? [],
  });

  return { newsletter, blog };
}

async function fetchContentManifest() {
  const apiBase = process.env.CONTENT_API_BASE || 'https://coderfee.com';
  const apiToken = process.env.API_TOKEN;

  if (!apiToken) {
    throw new Error('Missing API_TOKEN');
  }

  const url = new URL('/api/content/manifest', apiBase);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`fetch content manifest failed: ${response.status}`);
  }

  return response.json();
}

async function fetchContentObject(key) {
  const apiBase = process.env.CONTENT_API_BASE || 'https://coderfee.com';
  const apiToken = process.env.API_TOKEN;
  const url = new URL('/api/content/object', apiBase);
  url.searchParams.set('key', key);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`fetch content object failed: ${key}: ${response.status}`);
  }

  return response.text();
}

async function syncManifestCollection(collection) {
  console.log(`- Syncing ${collection.name} from Worker manifest prefix "${collection.prefix}"`);

  await fs.mkdir(collection.cacheDir, { recursive: true });

  const remoteFiles = collection.remoteFiles.filter((item) => item.key && !item.key.endsWith('/'));
  console.log(`   - ${collection.name}: found ${remoteFiles.length} files in manifest.`);

  if (remoteFiles.length === 0) {
    throw new Error(`${collection.name} manifest prefix is empty: ${collection.prefix}`);
  }

  await syncManifestToCache(collection, remoteFiles);

  const outputFiles = await collection.transform(collection.cacheDir);
  await writeOutput(collection.outputDir, outputFiles);

  console.log(`   - ${collection.name}: wrote ${outputFiles.length} files.`);

  return {
    name: collection.name,
    prefix: collection.prefix,
    remoteFiles: remoteFiles.length,
    outputFiles: outputFiles.length,
  };
}

async function syncManifestToCache(collection, remoteFiles) {
  const manifestPath = path.join(collection.cacheDir, '.manifest.json');
  const currentManifest = Object.fromEntries(
    remoteFiles.map((item) => [
      item.key,
      {
        etag: item.etag,
        lastModified: item.lastModified,
        size: item.size,
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
    const relativePath = item.key.slice(collection.prefix.length);
    const localPath = path.join(collection.cacheDir, relativePath);

    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, await fetchContentObject(item.key));
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

async function writeOutput(outputDir, files) {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const file of files) {
    const outputPath = path.join(outputDir, file.path);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, file.content);
  }
}

async function transformNewsletter(sourceDir) {
  const sourceFiles = (await getLocalFiles(sourceDir)).filter((file) => /\.(md|mdx)$/.test(file));

  return Promise.all(
    sourceFiles.map(async (file) => ({
      path: `${path.basename(file, path.extname(file))}.mdx`,
      content: await fs.readFile(file, 'utf8'),
    })),
  );
}

async function transformBlog(sourceDir) {
  const sourceFiles = (await getLocalFiles(sourceDir)).filter((file) => /\.(md|mdx)$/.test(file));
  const outputFiles = [];
  const seenSlugs = new Set();

  for (const file of sourceFiles) {
    const article = parseFrontmatter(await fs.readFile(file, 'utf8'));

    if (!shouldPublishBlogPost(article.data)) {
      continue;
    }

    assertRequiredBlogFields(article.data, file);

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

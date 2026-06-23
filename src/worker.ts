type Mode = 'weekly' | 'monthly' | 'annually' | 'overall';

interface Env {
  ASSETS: Fetcher;
  CONTENT_BUCKET: R2Bucket;
  CONTENT_KV: KVNamespace;
  API_BASE?: string;
  API_TOKEN?: string;
}

const MODES: Mode[] = ['weekly', 'monthly', 'annually', 'overall'];
const CACHE_KEY = 'https://coderfee.com/api/weread/readdata';
const CACHE_TTL_SECONDS = 60 * 60 * 6;
const CONTENT_MANIFEST_KEY = 'content-manifest';
const CONTENT_PREFIXES = {
  blog: '02 Writing/03 Blog/',
  newsletter: '03 Newsletter/',
} as const;

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${CACHE_TTL_SECONDS}`,
      ...init?.headers,
    },
  });
}

async function fetchMode(env: Env, mode: Mode) {
  if (!env.API_BASE || !env.API_TOKEN) {
    throw new Error('Missing API_BASE or API_TOKEN');
  }

  const url = new URL('/api/weread/readdata', env.API_BASE);
  url.searchParams.set('mode', mode);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.API_TOKEN}`,
      'x-build-client': 'coderfee.com',
    },
  });

  if (!response.ok) {
    throw new Error(`fetch ${mode} failed: ${response.status}`);
  }

  const payload = await response.json<{
    success?: boolean;
    message?: string;
    data?: {
      summary?: unknown;
    };
  }>();

  if (!payload.success) {
    throw new Error(payload.message || `fetch ${mode} failed`);
  }

  return payload.data?.summary ?? null;
}

async function fetchWereadData(env: Env) {
  const entries = await Promise.all(MODES.map(async (mode) => [mode, await fetchMode(env, mode)] as const));

  return {
    updatedAt: new Date().toISOString(),
    data: Object.fromEntries(entries),
  };
}

async function getWereadData(env: Env, forceRefresh = false) {
  const cache = (caches as CacheStorage & { default: Cache }).default;
  const cacheRequest = new Request(CACHE_KEY);

  if (!forceRefresh) {
    const cached = await cache.match(cacheRequest);
    if (cached) return cached;
  }

  const response = json(await fetchWereadData(env));
  await cache.put(cacheRequest, response.clone());

  return response;
}

function assertAuthorized(request: Request, env: Env) {
  if (!env.API_TOKEN) {
    throw new Error('Missing API_TOKEN');
  }

  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${env.API_TOKEN}`) {
    return json({ message: 'Unauthorized' }, { status: 401, headers: { 'cache-control': 'no-store' } });
  }

  return null;
}

async function listBucketObjects(bucket: R2Bucket, prefix: string) {
  const objects = [];
  let cursor: string | undefined;

  do {
    const listed = await bucket.list({ prefix, cursor });
    objects.push(...listed.objects.filter((object) => !object.key.endsWith('/')));
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  return objects;
}

async function buildContentManifest(env: Env) {
  const collections = Object.fromEntries(
    await Promise.all(
      Object.entries(CONTENT_PREFIXES).map(async ([name, prefix]) => {
        const objects = await listBucketObjects(env.CONTENT_BUCKET, prefix);
        return [
          name,
          objects.map((object) => ({
            key: object.key,
            etag: object.etag,
            size: object.size,
            lastModified: object.uploaded.toISOString(),
          })),
        ];
      }),
    ),
  );

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    prefixes: CONTENT_PREFIXES,
    collections,
  };
}

async function getContentManifest(env: Env, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = await env.CONTENT_KV.get(CONTENT_MANIFEST_KEY, 'json');
    if (cached) return cached;
  }

  const manifest = await buildContentManifest(env);
  await env.CONTENT_KV.put(CONTENT_MANIFEST_KEY, JSON.stringify(manifest));

  return manifest;
}

async function getContentObject(request: Request, env: Env) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key || !Object.values(CONTENT_PREFIXES).some((prefix) => key.startsWith(prefix))) {
    return json({ message: 'Invalid content key' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  const object = await env.CONTENT_BUCKET.get(key);
  if (!object) {
    return json({ message: 'Content object not found' }, { status: 404, headers: { 'cache-control': 'no-store' } });
  }

  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'text/plain; charset=utf-8',
      etag: object.etag,
      'cache-control': `private, max-age=${CACHE_TTL_SECONDS}`,
    },
  });
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/weread/readdata') {
      return getWereadData(env, url.searchParams.get('refresh') === '1');
    }

    if (url.pathname === '/api/content/manifest') {
      const unauthorized = assertAuthorized(request, env);
      if (unauthorized) return unauthorized;

      return json(await getContentManifest(env, url.searchParams.get('refresh') === '1'));
    }

    if (url.pathname === '/api/content/object') {
      const unauthorized = assertAuthorized(request, env);
      if (unauthorized) return unauthorized;

      return getContentObject(request, env);
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(Promise.all([getWereadData(env, true), getContentManifest(env, true)]));
  },
};

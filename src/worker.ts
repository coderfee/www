type Mode = 'weekly' | 'monthly' | 'annually' | 'overall';

interface Env {
  ASSETS: Fetcher;
  API_BASE?: string;
  API_TOKEN?: string;
}

const MODES: Mode[] = ['weekly', 'monthly', 'annually', 'overall'];
const CACHE_KEY = 'https://coderfee.com/api/weread/readdata';
const CACHE_TTL_SECONDS = 60 * 60 * 6;

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

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/weread/readdata') {
      return getWereadData(env, url.searchParams.get('refresh') === '1');
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(getWereadData(env, true));
  },
};

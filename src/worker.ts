import { Hono } from 'hono';

interface Env {
  ASSETS: Fetcher;
  API_BASE: string;
  API_TOKEN: string;
  GITHUB_TOKEN?: string;
}

const API_TIMEOUT_MS = 3000;
const WEREAD_MODES = ['weekly', 'monthly', 'annually', 'overall'] as const;

type WereadMode = (typeof WEREAD_MODES)[number];

interface WereadApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    summary?: unknown;
  };
}

const app = new Hono<{ Bindings: Env }>();

function getProxyHeaders(request: Request) {
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  return headers;
}

function getRequestBody(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined;
  }

  return request.body;
}

app.all('/api/blog/views', async (c) => {
  const upstreamUrl = new URL('/api/blog/views', c.env.API_BASE);
  const headers = getProxyHeaders(c.req.raw);
  headers.set('authorization', `Bearer ${c.env.API_TOKEN}`);

  const signal = AbortSignal.timeout(API_TIMEOUT_MS);

  try {
    const response = await fetch(upstreamUrl, {
      method: c.req.raw.method,
      headers,
      body: getRequestBody(c.req.raw),
      redirect: 'manual',
      signal,
    });

    if (!response.ok) {
      console.error('[ViewCounts Proxy] Upstream request failed:', {
        method: c.req.raw.method,
        status: response.status,
        statusText: response.statusText,
      });
      return c.json(
        {
          success: false,
          message: '访问统计暂时不可用，请稍后再试',
        },
        502,
      );
    }

    return response;
  } catch (error) {
    console.error('[ViewCounts Proxy] Failed to proxy request:', error);

    return c.json(
      {
        success: false,
        message: '访问统计暂时不可用，请稍后再试',
      },
      502,
    );
  }
});

async function fetchWereadSummary(env: Env, mode: WereadMode) {
  const upstreamUrl = new URL('/api/weread/readdata', env.API_BASE);
  upstreamUrl.searchParams.set('mode', mode);

  const response = await fetch(upstreamUrl, {
    headers: {
      authorization: `Bearer ${env.API_TOKEN}`,
    },
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`upstream ${mode} failed: ${response.status}`);
  }

  const payload = (await response.json()) as WereadApiResponse;

  if (!payload.success) {
    throw new Error(payload.message ?? `upstream ${mode} failed`);
  }

  return payload.data?.summary ?? null;
}

app.get('/api/weread/readdata', async (c) => {
  try {
    const entries = await Promise.all(
      WEREAD_MODES.map(async (mode) => [mode, await fetchWereadSummary(c.env, mode)] as const),
    );

    return c.json(
      {
        updatedAt: new Date().toISOString(),
        data: Object.fromEntries(entries),
      },
      200,
      {
        'cache-control': 'no-store',
      },
    );
  } catch (error) {
    console.error('[WeRead Proxy] Failed to fetch read data:', error);

    return c.json(
      {
        success: false,
        message: 'WeRead data is temporarily unavailable',
      },
      502,
    );
  }
});

const GITHUB_STATS_CACHE_KEY = 'https://blog.internal/api/github/stats';
const GITHUB_STATS_CACHE_TTL_S = 60 * 60;

interface GitHubUser {
  public_repos: number;
  followers: number;
  created_at: string;
  avatar_url: string;
  name: string | null;
}

async function fetchGitHubStats(env: Env, username: string) {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': 'blog-worker',
  };
  if (env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers }),
  ]);

  if (!userRes.ok) throw new Error(`github user failed: ${userRes.status}`);
  if (!reposRes.ok) throw new Error(`github repos failed: ${reposRes.status}`);

  const user = (await userRes.json()) as GitHubUser;
  const repos: { stargazers_count: number }[] = await reposRes.json();

  return {
    repos: user.public_repos,
    followers: user.followers,
    stars: repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0),
    since: new Date(user.created_at).getFullYear(),
    avatar: user.avatar_url,
    name: user.name || username,
  };
}

app.get('/api/github/stats', async (c) => {
  const username = c.req.query('username') || 'coderfee';

  const cache = (caches as unknown as { default: Cache }).default;
  const cached = await cache.match(GITHUB_STATS_CACHE_KEY);
  if (cached) {
    return cached;
  }

  try {
    const stats = await fetchGitHubStats(c.env, username);

    const response = new Response(JSON.stringify({ data: stats }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': `public, max-age=${GITHUB_STATS_CACHE_TTL_S}`,
      },
    });

    c.executionCtx.waitUntil(cache.put(GITHUB_STATS_CACHE_KEY, response.clone()));

    return response;
  } catch (error) {
    console.error('[GitHub Proxy] Failed to fetch stats:', error);

    return c.json(
      {
        success: false,
        message: 'GitHub stats are temporarily unavailable',
      },
      502,
    );
  }
});

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;

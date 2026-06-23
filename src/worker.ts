import { Hono } from 'hono';

interface Env {
  ASSETS: Fetcher;
  API_BASE: string;
  API_TOKEN: string;
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

    return response;
  } catch (error) {
    console.error('[ViewCounts Proxy] Failed to proxy request:', error);

    return c.json(
      {
        success: false,
        message: 'View counts are temporarily unavailable',
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

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;

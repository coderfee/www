import { Hono } from 'hono';

interface Env {
  ASSETS: Fetcher;
  API_BASE: string;
}

const VIEW_COUNT_TIMEOUT_MS = 3000;
const app = new Hono<{ Bindings: Env }>();

app.all('/api/blog/views', async (c) => {
  const upstreamUrl = new URL('/api/blog/views', c.env.API_BASE);
  const headers = new Headers(c.req.raw.headers);
  headers.delete('host');
  headers.delete('content-length');

  const signal = AbortSignal.timeout(VIEW_COUNT_TIMEOUT_MS);

  try {
    const response = await fetch(upstreamUrl, {
      method: c.req.raw.method,
      headers,
      body: c.req.raw.body,
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

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;

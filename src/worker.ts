import { Hono } from 'hono';

interface Env {
  ASSETS: Fetcher;
  API_BASE: string;
}

const app = new Hono<{ Bindings: Env }>();

app.all('/api/blog/views', async (c) => {
  const upstreamUrl = new URL('/api/blog/views', c.env.API_BASE);
  const headers = new Headers(c.req.raw.headers);
  headers.delete('host');
  headers.delete('content-length');

  return fetch(upstreamUrl, {
    method: c.req.raw.method,
    headers,
    body: c.req.raw.body,
    redirect: 'manual',
  });
});

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;

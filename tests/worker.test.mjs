import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import worker from '../src/worker.ts';

const originalFetch = globalThis.fetch;
const originalCaches = globalThis.caches;
const env = {
  API_BASE_URL: 'https://api.test',
  BLOG_API_TOKEN_STORE: { get: async () => 'test-blog-token' },
};
const ctx = { waitUntil() {} };

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.caches = originalCaches;
});

test('访问统计从 Store 读取令牌，并覆盖来访请求的认证头', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), 'https://api.test/api/blog/page-views');
    assert.equal(options.headers.get('authorization'), 'Bearer test-blog-token');
    return Response.json({ success: true });
  };
  const response = await worker.fetch(
    new Request('https://blog.test/api/blog/page-views', {
      method: 'POST',
      headers: { authorization: 'Bearer visitor-token' },
      body: '{}',
    }),
    env,
    ctx,
  );
  assert.equal(response.status, 200);
});

test('空 Blog 令牌返回 502，并隔离上游调用', async () => {
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    return Response.json({ success: true });
  };
  const response = await worker.fetch(
    new Request('https://blog.test/api/blog/page-views', {
      method: 'POST',
      body: '{}',
    }),
    { ...env, BLOG_API_TOKEN_STORE: { get: async () => '' } },
    ctx,
  );
  assert.equal(response.status, 502);
  assert.equal(requests, 0);
});

test('微信读书四种周期均使用 Store 令牌', async () => {
  const modes = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.get('authorization'), 'Bearer test-blog-token');
    modes.push(url.searchParams.get('mode'));
    return Response.json({ success: true, data: { summary: { books: 1 } } });
  };
  const response = await worker.fetch(new Request('https://blog.test/api/weread/readdata'), env, ctx);
  assert.equal(response.status, 200);
  assert.deepEqual(modes.sort(), ['annually', 'monthly', 'overall', 'weekly']);
});

for (const hostname of ['localhost', '127.0.0.1', '[::1]']) {
  test(`本机 API ${hostname} 的访问统计与读书代理免 Token`, async () => {
    let requests = 0;
    globalThis.fetch = async (_url, options) => {
      requests++;
      assert.equal(options.headers.has('authorization'), false);
      return Response.json({ success: true, data: { summary: { books: 1 } } });
    };
    const localEnv = { API_BASE_URL: `http://${hostname}:8787` };
    const pageViews = await worker.fetch(
      new Request('https://blog.test/api/blog/page-views', {
        method: 'POST',
        headers: { authorization: 'Bearer visitor-token' },
        body: '{}',
      }),
      localEnv,
      ctx,
    );
    assert.equal(pageViews.status, 200);
    const weread = await worker.fetch(new Request('https://blog.test/api/weread/readdata'), localEnv, ctx);
    assert.equal(weread.status, 200);
    assert.equal(requests, 5);
  });
}

test('带 localhost 前缀的远程 API 继续读取 Store 令牌', async () => {
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.get('authorization'), 'Bearer test-blog-token');
    return Response.json({ success: true });
  };
  const response = await worker.fetch(
    new Request('https://blog.test/api/blog/page-views', { method: 'POST', body: '{}' }),
    { ...env, API_BASE_URL: 'https://localhost.example.com' },
    ctx,
  );
  assert.equal(response.status, 200);
});

test('GitHub 统计使用 Store Token，响应仅包含统计数据', async () => {
  globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.authorization, 'Bearer test-github-token');
    return String(url).includes('/repos?')
      ? Response.json([{ stargazers_count: 3 }])
      : Response.json({ public_repos: 1, followers: 2, created_at: '2020-01-01', avatar_url: '', name: 'test' });
  };
  const response = await worker.fetch(
    new Request('https://blog.test/api/github/stats'),
    {
      ...env,
      GITHUB_TOKEN_STORE: { get: async () => 'test-github-token' },
    },
    ctx,
  );
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.equal(JSON.parse(body).data.stars, 3);
  assert.equal(body.includes('test-github-token'), false);
});

test('GitHub Token 绑定可选，公开统计支持匿名查询', async () => {
  globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.authorization, undefined);
    return String(url).includes('/repos?')
      ? Response.json([])
      : Response.json({ public_repos: 0, followers: 0, created_at: '2020-01-01', avatar_url: '', name: 'test' });
  };
  const response = await worker.fetch(new Request('https://blog.test/api/github/stats'), env, ctx);
  assert.equal(response.status, 200);
});

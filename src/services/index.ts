import ky, { type BeforeRequestHook } from 'ky';

export type ApiResponse<T = unknown> = {
  success: boolean;
  data: T;
};

const beforeRequest: BeforeRequestHook = (request) => {
  if (import.meta.env.DEV) {
    const mockResponse: ApiResponse<string> = {
      success: true,
      data: 'Request intercepted in DEV mode.',
    };
    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const http = ky.create({
  prefixUrl: import.meta.env.DEV ? 'http://localhost:8787' : import.meta.env.PUBLIC_BASE_API_URL,
  credentials: 'include',
  hooks: {
    beforeRequest: [beforeRequest],
  },
});

export async function view(json: { slug: string, title: string }) {
  return await http
    .post('blog/post/view', {
      json,
    })
    .json<ApiResponse<number>>();
}

export async function summary(json: { slug: string, content: string }) {
  return await http
    .post('blog/post/summary', {
      json,
    })
    .json();
}

export async function heartbeat() {
  let uid = localStorage.getItem('uid');
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem('uid', uid);
  }
  return await http.get(`blog/heartbeat?uid=${uid}`).json<ApiResponse>();
}

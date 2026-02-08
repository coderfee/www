import { env } from 'cloudflare:workers';

export async function GET() {
  const res = await fetch('https://api.coderfee.com/api/blog/views', {
    headers: {
      Authorization: `Bearer ${env.BEARER_TOKEN}`,
    },
  });
  const data = await res.json();
  console.log(data);

  return new Response('ok');
}

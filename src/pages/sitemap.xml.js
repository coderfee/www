import { getCollection } from 'astro:content';

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const absoluteUrl = (site, pathname) => new URL(pathname, site).toString();

export async function GET({ site }) {
  if (!site) {
    throw new TypeError('context.site falsy');
  }

  const [blog, newsletter] = await Promise.all([getCollection('blog'), getCollection('newsletter')]);

  const posts = blog
    .filter(({ data: { draft = false } }) => !draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const issues = newsletter.filter(({ data: { draft = false } }) => !draft);

  const entries = ['/', '/about/', '/archive/', '/reading/', '/newsletter/'].map((pathname) => ({
    loc: absoluteUrl(site, pathname),
  }));

  for (const post of posts) {
    entries.push({
      loc: absoluteUrl(site, `/blog/${post.data.slug}/`),
      lastmod: (post.data.updated ?? post.data.date).toISOString(),
    });
  }

  // 单篇文章的 tag 页内容过薄，不进入 sitemap，但仍保留页面本身
  const tags = new Map();
  for (const post of posts) {
    const lastmod = post.data.updated ?? post.data.date;
    for (const tag of post.data.tags ?? []) {
      const current = tags.get(tag);
      tags.set(tag, {
        count: (current?.count ?? 0) + 1,
        lastmod: !current || lastmod > current.lastmod ? lastmod : current.lastmod,
      });
    }
  }

  for (const [tag, { count, lastmod }] of tags) {
    if (count < 2) {
      continue;
    }

    entries.push({
      loc: absoluteUrl(site, `/blog/tags/${encodeURIComponent(tag)}/`),
      lastmod: lastmod.toISOString(),
    });
  }

  for (const issue of issues) {
    entries.push({
      loc: absoluteUrl(site, `/newsletter/${issue.id}/`),
      lastmod: issue.data.date.toISOString(),
    });
  }

  const urls = entries
    .map(
      ({ loc, lastmod }) => `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
    )
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
      },
    },
  );
}

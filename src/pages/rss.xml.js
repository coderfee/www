import { loadRenderers } from 'astro:container';
import { getCollection, render } from 'astro:content';
import { getContainerRenderer } from '@astrojs/mdx';
import rss from '@astrojs/rss';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { FOLO_CHALLENGE, SITE_DESCRIPTION, SITE_TITLE } from '@/consts';

export async function GET(context) {
  if (!context.site) {
    throw new TypeError('context.site falsy');
  }

  const container = await AstroContainer.create({
    renderers: await loadRenderers([getContainerRenderer()]),
  });

  const blog = await getCollection('blog');
  const posts = blog
    .filter(({ data: { draft = false } }) => !draft)
    .sort(({ data: { date: dateA } }, { data: { date: dateB } }) => dateB.valueOf() - dateA.valueOf());

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    customData: FOLO_CHALLENGE,
    items: await Promise.all(
      posts.map(async (post) => ({
        ...post.data,
        pubDate: post.data.date,
        description: post.data.tldr,
        link: `/blog/${post.id}/`,
        content: await container.renderToString((await render(post)).Content),
      })),
    ),
  });
}

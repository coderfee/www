import { loadRenderers } from 'astro:container';
import { getCollection } from 'astro:content';
import { getContainerRenderer } from '@astrojs/mdx';
import rss from '@astrojs/rss';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts';

export async function GET(context) {
  if (!context.site) {
    throw new TypeError('context.site falsy');
  }

  const container = await AstroContainer.create({
    renderers: await loadRenderers([getContainerRenderer()]),
  });

  const newsletter = await getCollection('newsletter');
  const posts = newsletter
    .sort(({ data: { date: dateA } }, { data: { date: dateB } }) => dateB.valueOf() - dateA.valueOf());

  return rss({
    title: `${SITE_TITLE} · 明日周刊`,
    description: `${SITE_DESCRIPTION}`,
    site: context.site,
    // stylesheet: '/rss/styles.xsl',
    items: await Promise.all(
      posts.map(async (post) => ({
        ...post.data,
        pubDate: post.data.date,
        description: post.data.tldr,
        link: `/newsletter/${post.slug}/`,
        content: await container.renderToString((await post.render()).Content),
      })),
    ),
  });
}

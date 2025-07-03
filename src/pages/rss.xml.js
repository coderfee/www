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

  const blog = await getCollection('blog');
  const posts = blog
    .filter(({ data: { draft = false } }) => !draft)
    .sort(({ data: { date: dateA } }, { data: { date: dateB } }) => dateB.valueOf() - dateA.valueOf());

  return rss({
    title: SITE_TITLE,
    description: `${SITE_DESCRIPTION} feedId:52340201851637784+userId:55812696340985856`,
    site: context.site,
    // stylesheet: '/rss/styles.xsl',
    items: await Promise.all(
      posts.map(async (post) => ({
        ...post.data,
        pubDate: post.data.date,
        description: post.data.tldr,
        link: `/blog/${post.slug}/`,
        content: await container.renderToString((await post.render()).Content),
      })),
    ),
  });
}

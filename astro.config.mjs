import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeCodeProps from 'rehype-mdx-code-props';
import rehypeSlug from 'rehype-slug';
import remarkToc from 'remark-toc';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  site: 'https://coderfee.com',
  publicDir: 'public',
  prefetch: {
    prefetch: true,
    defaultStrategy: 'load',
  },
  markdown: {
    syntaxHighlight: 'shiki',
    gfm: true,
    shikiConfig: {
      theme: 'vitesse-dark',
      wrap: true,
      transformers: [
        {
          name: 'add-copy-button',
          pre(node) {
            node.children.push({
              type: 'element',
              tagName: 'button',
              properties: {
                className: ['copy-code'],
                'aria-label': '复制代码',
              },
              children: [{ type: 'text', value: '复制' }],
            });
          },
        },
      ],
    },
    remarkPlugins: [[remarkToc, { headings: ['h2', 'h3', 'h4'] }]],
    rehypePlugins: [
      [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }]],
      [rehypeCodeProps, []],
      [
        rehypeExternalLinks,
        {
          target: '_blank',
        },
      ],
    ],
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      changefreq: 'weekly',
    }),
  ],
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [
      tailwindcss(),
      Icons({
        compiler: 'astro',
      }),
    ],
    build: {
      rollupOptions: {
        external: ['fsevents'],
      },
    },
  },
});

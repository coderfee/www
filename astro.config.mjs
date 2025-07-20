import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';
import { defineConfig, fontProviders } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeCodeProps from 'rehype-mdx-code-props';
import rehypeSlug from 'rehype-slug';
import remarkToc from 'remark-toc';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  experimental: {
    fonts: [
      {
        name: 'LXGWZhenKai',
        cssVariable: '--font-lxgw',
        provider: 'local',
        variants: [
          {
            src: ['./src/assets/fonts/LXGWZhenKai-Regular.ttf'],
          }
        ],
      },
    ],
  },
  site: 'https://coderfee.com',
  publicDir: 'public',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  image: {
    // 配置图片优化设置
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: 268402689, // 限制输入像素数量 (16384x16384)
      },
    },
    // 配置图片格式和质量
    domains: [],
    remotePatterns: [],
    // 启用图片优化
    experimentalLayout: 'responsive',
  },
  markdown: {
    syntaxHighlight: 'shiki',
    gfm: true,
    shikiConfig: {
      theme: 'vitesse-dark',
      wrap: true,
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
    pagefind(),
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
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
});

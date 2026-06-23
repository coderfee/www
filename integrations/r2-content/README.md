# R2 Content Integration

Astro integration that syncs Markdown content before Astro starts.

## Local Development

`pnpm dev` runs `astro dev`. During `astro:server:setup`, this integration syncs local content from:

```text
/Users/chen/Obsidian/notes/03 Newsletter -> src/content/newsletter
/Users/chen/Obsidian/notes/02 Writing/03 Blog -> src/content/blog
```

## Production Build

Create `.env` locally, or configure the same variables in CI:

```ini
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
```

## Usage

The integration is registered in `astro.config.mjs`:

```js
import r2Content from './integrations/r2-content/index.mjs';

export default defineConfig({
  integrations: [
    r2Content({
      local: {
        newsletterDir: '/Users/chen/Obsidian/notes/03 Newsletter',
        blogDir: '/Users/chen/Obsidian/notes/02 Writing/03 Blog',
      },
      remote: {
        newsletterPrefix: '03 Newsletter/',
        blogPrefix: '02 Writing/03 Blog/',
      },
      output: {
        newsletterDir: 'src/content/newsletter',
        blogDir: 'src/content/blog',
      },
      r2: {
        bucketName: 'obsidian',
      },
    }),
  ],
});
```

`pnpm build` runs `astro build`; during `astro:build:start`, this integration syncs content from Cloudflare R2:

```text
03 Newsletter/ -> src/content/newsletter
02 Writing/03 Blog/ -> src/content/blog
```

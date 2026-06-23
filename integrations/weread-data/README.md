# weread-data

Astro integration that fetches WeRead summary data before production builds.

## Development

`pnpm dev` also fetches WeRead summaries during `astro:server:setup`, so the reading page can load the same static JSON locally.

## Build

`pnpm build` fetches WeRead summaries from the configured backend API during `astro:config:setup`, then writes:

```text
public/data/weread.json
```

The frontend reads this static JSON file from:

```text
/data/weread.json
```

## Environment

Build environment variables:

```text
API_BASE
API_TOKEN
```

## Configuration

```js
import wereadData from './integrations/weread-data/index.mjs';

export default defineConfig({
  integrations: [
    wereadData({
      outputFile: 'public/data/weread.json',
      modes: ['weekly', 'monthly', 'annually', 'overall'],
    }),
  ],
});
```

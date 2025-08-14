/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_SERVICE_KEY: string;
  readonly PUBLIC_BASE_API_URL: string;
}

// biome-ignore lint/correctness/noUnusedVariables: import.meta
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png';

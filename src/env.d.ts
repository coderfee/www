type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png';

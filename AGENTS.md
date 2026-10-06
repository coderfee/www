# AGENTS.md

Astro 博客与 Newsletter：MDX 内容分 `blog` / `newsletter` 两个 collection（`src/content/`），页面由 Astro 生成，交互组件用 React，样式走 TailwindCSS，静态资源存 Cloudflare R2。包管理用 bun，代码走 Biome，提交经 Lefthook + Commitlint。

## 结构

- `src/pages/` 路由页面；`src/layouts/` 版式（`BaseLayout` 与 `NewsletterLayout`）；`src/components/` 组件；`src/lib/` 工具与数据获取；`src/worker.ts` Worker 入口。
- `integrations/` 构建期集成；`docs/` 功能设计记录。

命令见 `package.json`（`bun run` 可列出）。

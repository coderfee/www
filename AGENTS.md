# AGENTS.MD

## 项目概述

这是 coderfee.com 的个人博客网站，采用现代 Web 技术构建，专注于性能和用户体验。该项目利用了：

- **Astro** 作为静态网站生成器，提供快速加载体验
- **React** 和 **TypeScript** 构建交互组件
- **TailwindCSS 4.x** 进行样式设计和响应式 UI
- **MDX** 用于内容页面，支持交互式 React 组件
- **Pagefind** 提供集成搜索功能
- **Cloudflare** 服务进行部署（Pages、Workers、D1）

博客部署在 [https://coderfee.com](https://coderfee.com)，具有响应式设计、SEO 优化和 RSS 订阅功能。

## 架构与结构

- `/src/pages/` - 遵循基于文件路由的 Astro 页面
- `/src/components/` - 可复用的 React 和 Astro 组件
- `/src/content/` - 内容集合（可能是博客文章和新闻简报）
- `/src/lib/` - 实用函数和共享库
- `/src/styles/` - 全局样式和 Tailwind 配置
- `/src/assets/` - 静态资源，包括字体
- `/src/services/` - 业务逻辑服务层
- `/scripts/` - 构建脚本，如用于内容同步的 `sync-r2.mjs`
- `/public/` - 静态资源目录

## 主要功能

1. **内容同步**：项目包含一个特殊的 `sync-r2.mjs` 脚本，将 Markdown 文件从 Cloudflare R2 存储同步到本地 MDX 文件，专门用于新闻简报内容。在开发和构建过程中执行。

2. **高级 Markdown 处理**：项目使用各种插件增强 markdown 功能：
   - 目录生成
   - 自动标题锚点和链接
   - 外部链接处理
   - 代码块属性
   - 使用 Shiki 进行语法高亮

3. **性能优化**：
   - 使用视口策略进行预取
   - 本地字体加载优化
   - MDX 集成实现交互内容
   - 自动图像优化
   - 按需加载组件

4. **SEO 与内容**：
   - 自动 sitemap 生成
   - RSS 订阅支持
   - 语义化 HTML 结构
   - 元数据优化

5. **国际化支持**：
   - 可扩展的多语言支持架构

## 技术栈细节

### 核心依赖
- `astro` - 静态站点生成器
- `@astrojs/react` - React 组件支持
- `@astrojs/mdx` - MDX 内容支持
- `@astrojs/rss` - RSS 订阅生成
- `@astrojs/sitemap` - Sitemap 生成
- `react`, `react-dom` - 交互组件开发
- `tailwindcss` - CSS 框架
- `framer-motion` - 动画效果
- `pagefind` - 本地搜索功能

### 开发工具
- `@biomejs/biome` - 代码格式化和 Lint 工具
- `@types/node`, `@types/react`, `@types/react-dom` - TypeScript 类型定义
- `lefthook` - Git 钩子管理
- `unplugin-icons` - 图标集成

### 构建与部署
- `@tailwindcss/vite` - Vite 集成
- `astro-pagefind` - Astro 集成的 Pagefind
- `@aws-sdk/client-s3` - AWS S3 兼容的 R2 存储客户端

## 构建和运行

### 先决条件
- Node.js 16+
- pnpm 7+

### 开发命令
- `pnpm dev` - 启动开发服务器（包含 sync-r2）
- `pnpm start` - 启动开发服务器的替代命令
- `pnpm build` - 构建生产版本（包含 sync-r2 和 pagefind）
- `pnpm preview` - 在本地预览生产构建

### 开发工具
- `pnpm check` - 运行 Biome 代码检查器和格式化程序
- `pnpm add` - 添加新的 shadcn 组件
- `pnpm upgrade` - 更新依赖项和 Astro

### 环境变量
项目使用 Cloudflare R2 进行内容同步：
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

## 开发约定

1. **代码格式**：使用 Biome 保持一致的代码风格：
   - 2 空格缩进
   - 120 字符行宽
   - 字符串使用单引号
   - JSX 属性使用双引号

2. **TypeScript**：启用严格空值检查，使用 React JSX 转换

3. **Git 钩子**：Lefthook 在提交时自动运行 Biome 格式化

4. **文件结构**：
   - Astro 页面用于路由
   - 组件按功能/功能组织
   - 内容采用 MDX 格式，带有 frontmatter 元数据

5. **路径别名**：使用 `@/*` 别名对应 `/src/*` 路径

6. **组件命名**：使用 PascalCase 命名 React 组件
   - 文件名与组件名保持一致（如 `Header.astro` 或 `Button.tsx`）

7. **内容组织**：内容使用 Astro 的内容集合功能
   - 定义内容类型 schema，确保数据一致性
   - 前置数据（frontmatter）包含必要的元数据（标题、日期、摘要等）

## 内容管理

项目实现了一个复杂的内容同步系统，从 Cloudflare R2 拉取新闻简报内容，并转换为 MDX 格式。这使得博客能够在云存储系统中维护内容，同时仍然受益于 Astro 的静态生成。

同步流程：
1. 从 R2 存储获取文件列表
2. 比较本地缓存与远程文件数量差异
3. 下载远程文件并转换为 MDX 格式
4. 将文件复制到 `src/content/newsletter` 目录

## 部署

网站专为部署在 Cloudflare Pages 上设计，并支持以下附加服务：
- Pages 用于托管
- Workers 用于无服务器函数
- D1 用于数据库功能

## 性能监控与优化

- 使用 Astro 的内置性能分析工具
- 定期检查 Lighthouse 评分
- 优化首屏加载时间
- 实施资源预加载策略

## Claude 交互规则

1. **语言规则**：始终使用简体中文进行交流
2. **文档查询**：查询文档相关操作请使用 context7 MCP

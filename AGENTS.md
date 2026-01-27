# AGENTS.md

这是 coderfee.com 个人博客的 AI Agent 开发指南。本项目基于 Astro 构建，使用 React、TypeScript 和 TailwindCSS。

## 项目概述

- **技术栈**: Astro 6.x + React 19 + TypeScript 5.x + TailwindCSS 4.x
- **包管理器**: pnpm 10.x（必须使用 pnpm，不支持 npm/yarn）
- **代码质量工具**: Biome (formatter + linter)
- **Git 工作流**: Lefthook + Commitlint
- **内容管理**: MDX (Blog + Newsletter)
- **搜索功能**: Pagefind
- **静态资源**: Cloudflare R2

## 快速开始

### 环境要求

- Node.js 16+
- pnpm 10.28.0 或更高版本

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器（会自动同步 R2 资源）
pnpm dev

# 构建生产环境
pnpm build
```

开发服务器默认运行在 `http://localhost:4321`

### 常用命令

```bash
pnpm dev          # 开发模式：同步 R2 + 启动 Astro 开发服务器
pnpm build        # 生产构建：同步 R2 + Astro 构建 + 生成 Pagefind 索引
pnpm lint         # 运行 Biome 和 Astro 类型检查
pnpm lint:fix     # 自动修复 Biome 问题
pnpm upgrade      # 更新所有依赖
pnpm sync-r2      # 手动同步 R2 静态资源
```

## 项目结构

```
www/
├── src/
│   ├── components/       # React/Astro 组件
│   │   ├── blog/        # 博客相关组件
│   │   ├── newsletter/  # Newsletter 相关组件
│   │   └── layouts/     # 布局组件
│   ├── content/         # MDX 内容
│   │   ├── blog/        # 博客文章
│   │   │   ├── 2024/
│   │   │   ├── 2025/
│   │   │   ├── archive/ # 归档文章
│   │   │   ├── pages/   # 关于页面、uses 页面等
│   │   │   └── year-in-review/
│   │   └── newsletter/  # Newsletter 文章
│   ├── pages/           # 路由页面
│   ├── lib/             # 工具函数
│   ├── styles/          # 全局样式
│   └── assets/          # 静态资源（图片、JSON 等）
├── public/              # 公共静态文件
├── scripts/             # 构建脚本
└── docs/                # 文档
```

## 代码规范

### TypeScript

- 严格模式已启用 (`strict: true` in tsconfig.json)
- 优先使用函数式组件和 React Hooks
- 类型定义文件放在 `types/` 目录

### 代码风格（Biome）

项目使用 Biome 进行代码格式化和 lint，配置文件：`biome.json`

**格式化规则：**
- 缩进：2 空格
- 换行符：LF
- 最大行宽：120 字符
- 引号：单引号（JavaScript/TypeScript）
- 分号：必须添加
- 尾随逗号：始终添加
- JSX 引号：双引号
- 箭头函数括号：始终添加

**重要约定：**
- 提交前会自动运行 `biome check --write` 修复问题
- `.astro` 文件不参与 Biome 检查，但会运行 `astro check`
- 使用 `pnpm lint:fix` 可以手动修复大部分格式问题

### 文件命名

- **组件文件**: PascalCase
  - Astro 组件: `.astro` (例如: `PostCard.astro`)
  - React 组件: `.tsx` (例如: `MailButton.tsx`)
- **工具函数**: camelCase `.ts` (例如: `helper.ts`)
- **配置文件**: kebab-case (例如: `astro.config.mjs`)
- **内容文件**: kebab-case `.mdx` (例如: `how-to-build-flomo-new-tab.mdx`)

## Git 工作流

### Commit 规范

项目使用 Commitlint 强制执行 Conventional Commits 规范：

**允许的 commit 类型：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或外部依赖
- `ci`: CI 配置
- `chore`: 其他不修改 src 或测试文件的更改
- `revert`: 回滚提交

**格式：**
```
<type>: <subject>

[optional body]

[optional footer]
```

**示例：**
```
feat: 添加 Newsletter 订阅功能
fix: 修复移动端导航菜单显示问题
docs: 更新 README 中的部署说明
refactor: 重构博客文章卡片组件
```

### Git Hooks（Lefthook）

项目配置了以下 Git hooks：

**pre-commit:**
- 自动运行 `biome check --write` 修复暂存文件
- 自动 stage 修复后的文件

**pre-push:**
- 运行 `biome check` 检查所有代码
- 运行 `astro check` 进行类型检查

**commit-msg:**
- 验证 commit message 格式（通过 Commitlint）

## 内容创作指南

### 博客文章

博客文章存放在 `src/content/blog/` 目录，使用 MDX 格式。

**文章 frontmatter 必需字段：**
```yaml
---
title: 文章标题
publishDate: 2025-01-27
description: 文章描述（用于 SEO）
tags: [标签1, 标签2]
---
```

**文章组织：**
- 当前年份文章：`src/content/blog/YYYY/MM/` (例如: `2025/01/`)
- 历史文章：`src/content/blog/YYYY/` (例如: `2024/`)
- 归档文章：`src/content/blog/archive/`
- 特殊页面：`src/content/blog/pages/` (如 about.mdx, uses.mdx)
- 年度回顾：`src/content/blog/year-in-review/`

**文章资源：**
- 图片资源放在 `src/assets/blog/` 对应目录
- 使用相对路径引用：`![描述](../../assets/blog/2025/image.png)`

### Newsletter

Newsletter 文章存放在 `src/content/newsletter/` 目录。

**组织结构：**
```
src/content/newsletter/
└── YYYY/
    └── MM/
        └── article-slug.mdx
```

## 组件开发

### Astro 组件

- 用于静态内容和布局
- 文件扩展名：`.astro`
- 优先使用 Astro 组件以获得最佳性能

**示例：**
```astro
---
// Component script (runs at build time)
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<div>
  <h1>{title}</h1>
</div>
```

### React 组件

- 用于需要客户端交互的功能
- 文件扩展名：`.tsx`
- 使用 `client:*` 指令控制 hydration 策略

**客户端指令：**
- `client:load` - 页面加载时立即 hydrate
- `client:idle` - 浏览器空闲时 hydrate
- `client:visible` - 组件进入视口时 hydrate
- `client:only="react"` - 仅在客户端渲染

**示例：**
```tsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## 样式指南

### TailwindCSS

- 使用 TailwindCSS 4.x
- 配置文件：`tailwind.config.ts`
- 全局样式：`src/styles/style.css`

**插件：**
- `@tailwindcss/typography` - 用于 prose 样式
- `tailwindcss-animate` - 动画工具类
- `tailwind-merge` - 合并类名

**最佳实践：**
- 优先使用 Tailwind 工具类
- 避免自定义 CSS，除非必要
- 响应式设计使用移动优先策略

## 搜索功能

项目使用 Pagefind 提供搜索功能：

- 构建时自动生成索引（`pnpm build` 时运行）
- 配置文件：`pagefind.yml`
- 类型定义：`types/pagefind.d.ts`

## 静态资源管理

### Cloudflare R2

项目使用 Cloudflare R2 存储大型静态资源：

- 同步脚本：`scripts/sync-r2.mjs`
- 在 `pnpm dev` 和 `pnpm build` 时自动运行
- 需要配置环境变量（`.env` 文件）

**环境变量：**
```env
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
```

## 性能优化建议

1. **图片优化**
   - 使用 Astro 的 `<Image>` 组件自动优化
   - 提供适当的 width 和 height 属性

2. **代码分割**
   - 合理使用 React 组件的 client 指令
   - 延迟加载非关键组件

3. **预取策略**
   - 配置 `prefetchAll: true` 在视口内预取链接

4. **构建优化**
   - 生产构建会自动压缩和优化资源
   - Pagefind 索引在构建时生成

## 部署

项目部署到静态托管平台（如 Cloudflare Pages、Vercel 等）：

**构建命令：** `pnpm build`
**输出目录：** `dist/`
**Node 版本：** 16+

## 常见问题

### 修改代码后保存无效？

检查是否有 Git hooks 失败：
- Biome 格式化可能修改了文件
- Astro 类型检查可能有错误
- Commit message 格式不正确

### 如何添加新的依赖？

```bash
# 生产依赖
pnpm add <package-name>

# 开发依赖
pnpm add -D <package-name>
```

### 如何更新依赖？

```bash
# 更新所有依赖
pnpm upgrade

# 更新特定依赖
pnpm update <package-name>
```

### Astro 组件中如何使用 React 组件？

```astro
---
import { Counter } from '../components/Counter';
---

<Counter client:load />
```

### 如何禁用某个文件的 Biome 检查？

在 `biome.json` 的 `linter.includes` 中排除：
```json
{
  "linter": {
    "includes": ["**/*.{js,ts,jsx,tsx}", "!**/path/to/file.ts"]
  }
}
```

## 重要提醒

1. **AI 助手必须使用简体中文与用户交流**，所有回复、解释和文档都应使用简体中文
2. **永远使用 pnpm**，不要使用 npm 或 yarn
3. **提交前运行 `pnpm lint`** 确保代码质量
4. **遵循 Conventional Commits** 规范编写 commit message
5. **新增组件优先考虑 Astro 组件**，只在需要交互时使用 React
6. **测试构建** 在 push 前运行 `pnpm build` 确保构建成功
7. **图片资源** 大型资源使用 R2，小型图标使用 public 或 assets 目录
8. **MDX 文章** 确保 frontmatter 包含所有必需字段
9. **响应式设计** 所有新功能都应该在移动端测试

## 技术决策记录

- **为什么用 Astro？** 静态博客需要极致的加载性能，Astro 的部分 hydration 和零 JS 默认策略最适合
- **为什么用 Biome 而不是 ESLint + Prettier？** Biome 更快，配置更简单，一个工具完成 format + lint
- **为什么用 TailwindCSS 4.x？** 新版本性能更好，配置更简单，支持原生 CSS
- **为什么 MDX？** 支持在 Markdown 中嵌入 React 组件，灵活性更高

---

**最后更新**: 2026-01-27
**维护者**: coderfee
**项目地址**: https://coderfee.com

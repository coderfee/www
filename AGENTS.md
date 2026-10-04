# AGENTS.md

> AI Agent 开发指南。本项目基于 Astro 构建，使用 React、TypeScript 和 TailwindCSS。

## 项目概述

- 技术栈: Astro 6.x + React 19 + TypeScript 5.x + TailwindCSS 4.x
- 包管理器: bun 1.4.x
- 代码质量: Biome (formatter + linter)
- Git Hooks: Lefthook + Commitlint
- 内容管理: MDX (Blog + Newsletter)
- 静态资源: Cloudflare R2

## 快速开始

```bash
bun run dev        # 启动开发服务器
bun run build      # 生产构建
bun run lint       # 运行代码检查
bun run lint:fix   # 自动修复问题
```

## 项目结构

```
www/
├── src/
│   ├── components/       # 组件（Astro/React）
│   ├── content/         # MDX 内容
│   ├── pages/           # 路由页面
│   ├── lib/             # 工具函数
│   ├── styles/          # 全局样式
│   └── assets/          # 静态资源
├── public/              # 公共静态文件
└── scripts/             # 构建脚本
```

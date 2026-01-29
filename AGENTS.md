# AGENTS.md

> AI Agent 开发指南。本项目基于 Astro 构建，使用 React、TypeScript 和 TailwindCSS。

## 重要提醒

1. 使用简体中文与用户交流
2. 永远使用 pnpm，不要使用 npm 或 yarn
3. 提交前运行 `pnpm lint` 确保代码质量
4. 新增组件优先考虑 Astro 组件，只在需要交互时使用 React
5. 遵循现有代码风格（通过查看现有代码和 Biome 配置自动发现）
6. 遵循 MDX frontmatter 格式（通过查看现有文章自动发现）
7. 响应式设计所有新功能都应该在移动端测试


## 项目概述

- 技术栈: Astro 6.x + React 19 + TypeScript 5.x + TailwindCSS 4.x
- 包管理器: pnpm 10.x（必须使用 pnpm，不支持 npm/yarn）
- 代码质量: Biome (formatter + linter)
- Git Hooks: Lefthook + Commitlint
- 内容管理: MDX (Blog + Newsletter)
- 静态资源: Cloudflare R2

## 快速开始

```bash
pnpm dev        # 启动开发服务器
pnpm build      # 生产构建
pnpm lint       # 运行代码检查
pnpm lint:fix   # 自动修复问题
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

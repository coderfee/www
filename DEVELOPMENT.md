# 开发指南

## 环境设置

### 安装依赖
```bash
# 安装 pnpm
npm install -g pnpm

# 克隆仓库
git clone https://github.com/coderfee/www.git
cd www

# 安装项目依赖
pnpm install
```

### 环境变量配置
复制 `.env.example` 并创建 `.env` 文件：
```bash
cp .env.example .env
```

在 `.env` 文件中填入 Cloudflare R2 相关配置信息。

## 开发流程

### 本地开发
```bash
# 启动开发服务器
pnpm dev

# 应用将在 http://localhost:4321 上运行
```

### 构建流程
```bash
# 构建生产版本
pnpm build

# 本地预览构建版本
pnpm preview
```

### 代码质量控制
```bash
# 运行代码检查和格式化
pnpm check

# 运行依赖项升级
pnpm upgrade
```

## 项目结构

```
www/
├── astro.config.mjs          # Astro 配置文件
├── biome.json               # Biome 代码检查配置
├── lefthook.yml             # Git 钩子配置
├── package.json             # 项目依赖和脚本
├── pnpm-lock.yaml           # 锁定依赖版本
├── tsconfig.json            # TypeScript 配置
├── pagefind.yml             # Pagefind 搜索配置
├── docs/                    # 项目文档
├── public/                  # 静态资源目录
├── src/
│   ├── assets/              # 静态资源（图片、字体等）
│   ├── components/          # React/Astro 组件
│   ├── content/             # 内容集合（博客文章、新闻简报）
│   ├── lib/                 # 工具函数和库
│   ├── pages/               # Astro 页面路由
│   ├── services/            # 业务逻辑服务
│   ├── styles/              # 全局样式
│   ├── consts.ts            # 常量定义
│   └── env.d.ts             # 环境类型定义
└── scripts/
    └── sync-r2.mjs          # R2 内容同步脚本
```

## 组件开发

### Astro 组件
- 文件扩展名：`.astro`
- 使用 Astro 语法构建页面和布局
- 支持在组件中嵌入 React、Vue 等框架组件

### React 组件
- 文件扩展名：`.tsx`
- 用于交互性较强的 UI 组件
- 需要在 Astro 配置中启用 React 集成

### 组件最佳实践
- 组件应保持单一职责
- 组件名称使用 PascalCase
- props 类型使用 TypeScript 定义
- 组件应具有良好的可重用性

## 内容管理

### 添加新博客文章
1. 在 `src/content/blog/` 目录下创建新的 `.mdx` 文件
2. 使用以下 frontmatter 结构：
   ```md
   ---
   title: "文章标题"
   description: "文章描述"
   pubDate: "2023-12-01T00:00:00.000Z"
   heroImage: "/assets/blog-image.jpg"
   tags: ["tag1", "tag2"]
   ---
   ```

### 新闻简报同步
- 新闻简报内容通过 `sync-r2.mjs` 脚本自动同步
- 该脚本在开发和构建时自动运行
- 确保 R2 环境变量配置正确

## 样式指南

### TailwindCSS
- 使用 TailwindCSS 进行样式开发
- 遵循原子化 CSS 原则
- 避免使用 @apply 指令，直接使用类名

### 主题定制
- 在 `tailwind.config.cjs` 中定义自定义主题
- 使用 CSS 变量定义颜色和间距系统
- 确保响应式设计覆盖所有屏幕尺寸

## 性能优化

### 图片优化
- 使用 Astro 的内置图片优化
- 优先使用 WebP 格式
- 实施懒加载策略

### 代码分割
- 使用 Astro 的组件懒加载功能
- 按需导入大型库
- 避免在首页加载不必要的 JavaScript

### 预加载策略
- 使用 Astro 的预加载功能
- 优先加载关键资源
- 预加载用户可能访问的页面

## Git 工作流程

### 分支管理
- 主分支：`main` - 生产代码
- 功能分支：`feature/功能描述` - 新功能开发
- 修复分支：`fix/问题描述` - bug 修复
- 发布分支：`release/版本号` - 版本发布

### 提交规范
使用约定式提交（Conventional Commits）：
- `feat:` 添加新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建工具或辅助工具变动

### 代码审查
- 所有更改需要通过 CI 检查
- 至少一个团队成员审查
- 确保代码符合项目规范

## 部署流程

### 自动部署
- 推送到 `main` 分支自动触发 Cloudflare Pages 构建
- 构建成功后自动部署到生产环境

### 手动部署
- 检查所有测试通过
- 确保依赖项是最新的
- 运行 `pnpm build` 验证构建成功
- 推送到 Git 仓库触发部署

## 故障排除

### 常见问题
1. **R2 同步失败**
   - 检查环境变量是否正确配置
   - 确认 R2 存储桶权限设置

2. **构建失败**
   - 运行 `pnpm check` 检查代码错误
   - 确认所有依赖项兼容

3. **性能问题**
   - 检查 Lighthouse 评分
   - 使用 Astro 的性能分析工具

### 调试技巧
- 使用 `console.log` 进行调试（仅在开发环境）
- 使用浏览器开发者工具检查网络请求
- 启用 Astro 的详细日志输出

## 贡献指南

### 代码贡献
1. Fork 项目仓库
2. 创建功能分支
3. 实现功能并编写测试
4. 提交符合规范的 commit
5. 创建 Pull Request

### 文档贡献
- 保持文档更新与代码同步
- 使用清晰易懂的语言
- 提供实际使用示例

### 技术支持
- 在 GitHub Issues 中报告问题
- 提供详细的错误信息和复现步骤
- 包含环境信息（Node.js 版本、pnpm 版本等）
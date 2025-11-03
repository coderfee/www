# coderfee.com 的 Copilot 指南

欢迎来到 coderfee.com 博客代码库！本指南将帮助你理解关键模式并做出有效贡献。

## 架构概览

这是一个基于 Astro 的博客，使用 React 组件，注重性能和用户体验：

- `src/pages/` - 基于文件的路由系统（如 `[...slug].astro` 处理动态博文）
- `src/content/` - MDX 格式的博客文章和新闻简报
  - `blog/` - 按年份组织的主要博客文章
  - `newsletter/` - 从 Cloudflare R2 同步的新闻简报内容
- `src/components/` - 可复用的 UI 组件
  - `common/` - 全站共享组件
  - `features/` - 按功能域组织的特定组件
  - `layouts/` - 页面布局模板
- `scripts/` - 构建工具（如用于内容同步的 `sync-r2.mjs`）

## 关键工作流

### 开发

```bash
# 启动开发服务器（包含 R2 内容同步）
pnpm dev

# 生产环境构建（包含同步和 pagefind）
pnpm build
```

### 内容同步系统

项目使用 Cloudflare R2 存储新闻简报内容：

1. `sync-r2.mjs` 脚本在开发/构建期间从 R2 拉取内容
2. 内容转换为 MDX 格式并存储在 `src/content/newsletter/`
3. 所需环境变量：`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

## 项目约定

### 文件组织
- MDX 内容位于 `src/content/{blog,newsletter}`
- 基于年份的博客文章结构：`blog/2024/post-slug.mdx`
- 组件按功能域组织

### 代码风格
- 使用 Biome 进行格式化（120 字符行限制，2 空格缩进）
- 字符串优先使用单引号，JSX 属性使用双引号
- TypeScript 启用严格空值检查

### 组件模式
- 页面布局使用 `.astro` 文件
- 交互功能使用 React 组件
- 通用工具函数在 `src/lib/helper.ts`
- SEO 元数据由 `DocumentMeta.astro` 处理

### 内容模式
- 博客文章使用 frontmatter 存储元数据
- 新闻简报内容自动从 R2 同步
- 图片按年份存储在 `src/assets/blog/` 中

## 集成点

1. **Cloudflare 服务**
   - Pages 用于托管
   - Workers 用于无服务器函数
   - D1 用于数据库功能
   - R2 用于新闻简报内容存储

2. **搜索集成**
   - 使用 Pagefind 进行静态搜索
   - 配置在 `pagefind.yml` 中

## 性能考虑

- Astro Islands 架构实现选择性水合
- 图片在构建时自动优化
- 优先使用静态生成和选择性客户端水合
- 使用 Tailwind 实现零运行时 CSS

## 常见任务

### 添加新博客文章
1. 在对应年份文件夹创建 MDX 文件
2. 添加 frontmatter 元数据
3. 将图片添加到 `src/assets/blog/[year]/`
4. 构建以验证路径和图片

### 更新新闻简报内容
- 内容在开发/构建时自动从 R2 同步
- 可通过 `sync-r2.mjs` 脚本手动同步
- 同步失败时检查环境变量

## Git 工作流规范

### 提交规范
1. Commit Message 格式：
   ```
   <type>: <subject>

   - 详细变更 1
   - 详细变更 2
   ```

2. Type 类型：
   - `feat`: 新功能
   - `fix`: 修复问题
   - `docs`: 文档变更
   - `style`: 代码格式修改
   - `refactor`: 代码重构
   - `perf`: 性能优化
   - `test`: 测试用例
   - `chore`: 其他修改

### 质量控制
1. Git Hooks：
   - 严格遵循项目的 Git hooks（Biome 检查和格式化）
   - 禁止使用 `--no-verify` 跳过钩子
   - 确保代码通过所有检查

2. 合并策略：
   - 先 pull 再 push
   - 解决冲突后重新提交
   - 保持提交历史整洁

3. 分支管理：
   - 遵循项目分支规范
   - 正确处理分支合并
   - 及时清理过时分支

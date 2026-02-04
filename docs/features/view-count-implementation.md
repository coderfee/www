# 文章阅读量功能实现方案

## 1. 需求分析

在博客的文章列表页（首页、归档页）和文章详情页展示每篇文章的阅读量（View Count）。

### 核心需求
1.  **全局数据共享**：接口一次性返回所有文章的阅读量，需要一个全局 Store 缓存这份数据，避免页面上多个组件重复请求。
2.  **跨页面缓存**：支持 MPA（多页应用）跳转时的缓存，即用户从首页进入详情页，不应丢失已获取的数据。
3.  **实时更新 (Mutation)**：用户访问详情页后，阅读量应立即 +1 并反馈在 UI 上（Optimistic UI）。
4.  **性能**：方案需轻量，不引入过重的依赖。

## 2. 技术选型

采用 Astro 官方推荐的 Islands Architecture 状态共享方案：**Nano Stores**。

-   **核心库**: `nanostores` (核心逻辑)
-   **React适配**: `@nanostores/react` (在 React 组件中使用)
-   **持久化**: `@nanostores/persistent` (利用 localStorage 实现跨页缓存)

### 为什么选择 Nano Stores?
-   **超轻量**：核心库极小，对 Bundle Size 影响微乎其微。
-   **框架无关**：逻辑层与 UI 层解耦，纯 TS 实现 Store，可以在 `.astro` 脚本、React 组件甚至纯 JS 中无缝调用。
-   **持久化支持**：官方插件完美支持将 Store 同步到 `localStorage`，解决 MPA 页面刷新数据丢失问题。

## 3. 架构设计

### 3.1 数据层 (`src/lib/store/view-counts.ts`)

创建一个持久化的 Map Store `viewCounts`。

-   **State**: `Record<string, string>` (key: slug, value: count)。
    -   *注*：`persistentMap` 要求 value 为 string，使用时需转换为 number。
-   **Persistence**: Key 为 `view-counts`，存储在 `localStorage`。
-   **Actions**:
    -   `fetchViewCounts()`: 调用后端 `GET /api/public/visit`，获取全量数据并更新 Store。
    -   `incrementViewCount(slug)`: 乐观更新（Optimistic Update），在内存/本地存储中直接 +1，随后（或同时）发送后端请求。

### 3.2 UI 层 (`src/components/ViewCount.tsx`)

一个纯展示的 React 组件。

-   **Props**: `{ slug: string }`
-   **Logic**: 使用 `useStore(viewCounts)` 订阅全局状态，根据 slug 渲染对应的数字。
-   **UI**: 包含一个小眼睛图标 (IconEye) 和格式化后的数字。

### 3.3 集成点

1.  **数据初始化**: 在 `BaseLayout.astro` 的 `<script>` 标签中调用 `fetchViewCounts()`。每次页面加载（或特定周期）刷新一次数据。
2.  **详情页**:
    -   `PostHeader.astro` 引入 `<ViewCount />`。
    -   保留原有的 `POST /api/public/visit` 逻辑，但在成功回调中调用 `incrementViewCount(slug)` 更新本地缓存。
3.  **列表页**:
    -   `PostCard.astro` 引入 `<ViewCount />`。

## 4. 接口定义

-   **获取数据**: `GET https://dash.coderfee.com/api/public/visit`
    -   Response: `{[slug: string]: number}`
-   **上报数据**: `POST https://dash.coderfee.com/api/public/visit`
    -   Body: `{ slug: string, title?: string }`

## 5. 开发任务清单

- [ ] 安装依赖 `nanostores @nanostores/react @nanostores/persistent`
- [ ] 创建 Store 文件 `src/lib/store/view-counts.ts`
- [ ] 创建 UI 组件 `src/components/ViewCount.tsx`
- [ ] 在 `BaseLayout` 中集成数据获取逻辑
- [ ] 修改 `PostHeader` 和 `PostCard` 引入组件
- [ ] 优化详情页的上报逻辑，增加本地 Store 的更新

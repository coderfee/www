# Newsletter 杂志风布局实现文档

## 概述
为了提升「明日周刊」页面的阅读仪式感与品牌识别度，我们将原本标准的网格布局重构为具有 **iOS 弥散风格** 与 **现代杂志排版** 特色的动态布局。

## 核心设计理念

### 1. 侧边垂直书脊 (Vertical Masthead)
*   **设计**：在桌面端将页面标题「明日周刊」与域名「coderfee.com」以 `writing-mode: vertical-rl` 垂直排列于页面左侧，并辅以纤细的装饰线。
*   **理念**：模拟实体杂志的书脊设计，建立强烈的个人品牌锚点。
*   **交互**：采用 `sticky` 定位，使品牌标识在滚动过程中始终驻留在视口左侧。
*   **响应式**：考虑到移动端屏幕宽度受限及视觉聚焦，侧边标题栏在 `lg` 断点以下自动隐藏，由全局导航栏承担导航功能。

### 2. 焦点位系统 (Featured System)
*   **设计**：提取最新一期周刊作为 `FeaturedCard`，占据 12 列网格的全宽。
*   **视觉**：采用左右分栏布局，大尺寸封面图配合超大衬线体标题，底部辅以巨大的半透明背景刊号（Issue Number）。

### 3. iOS 弥散质感 (Diffused Glassmorphism)
*   **阴影**：采用超大模糊半径（64px）且带负扩散距离的自定义阴影，营造高级的“弥散”视觉效果。
    *   `shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]`
*   **材质**：卡片采用 `bg-white/80` 结合 `backdrop-blur-xl`，实现通透的玻璃拟态感。
*   **圆角**：采用 `2.5rem` (40px) 的超大圆角，符合 iOS 现代审美。

### 动态网格 (Dynamic Asymmetric Grid)
*   **结构**：采用 12 列网格系统。
*   **模式**：后续卡片按照“2个半宽 + 3个三分之一宽”的循环模式自动排列，打破网格布局的沉闷。

## 技术实现细节

### 组件结构
- `NewsletterGrid.tsx`: 核心布局容器，处理响应式侧边栏与主网格分配。
- `FeaturedCard`: 焦点位子组件，处理复杂的分栏与排版层次。
- `NewsletterCard`: 标准位子组件，集成 `framer-motion` 与鼠标位移监听实现轻微视差倾斜。

### 动画优化
*   **消除抖动**：为 `sticky` 元素及导航栏添加 `transform-gpu` 与 `[backface-visibility:hidden]`，解决滚动时的渲染位移问题。
*   **动画解耦**：将 CSS 的 `transition` 限制在 `shadow` 等非位移属性上，确保不与 Framer Motion 的 `transform` 动画产生冲突，消除加载瞬间的视觉跳动。

## 状态记录
- [x] **Sticky Sidebar**: 已实现。
- [x] **Mobile Optimization**: 移动端隐藏侧边栏，优化屏幕空间利用率。
- [x] **Performance Tuning**: 消除动画冲突与滚动抖动。
- [ ] **Scroll Parallax**: 为背景大数字增加滚动视差效果（待选）。

---
*更新日期：2026年2月4日*
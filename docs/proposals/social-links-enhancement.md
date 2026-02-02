# 实现方案：社交链接交互增强 (Email, RSS, Sitemap)

**日期**: 2026-02-02
**状态**: 提议中
**目标**: 提升 `AboutProfile` 组件中非跳转类链接的功能性与用户体验。

## 1. 方案概述

目前这些链接大多直接跳转或唤起系统应用，本方案提议引入中间层弹窗，提供更多实用功能（如一键复制、订阅引导、创作统计）。

## 2. 详细设计

### 2.1 Email 增强：解决唤起尴尬
- **痛点**: `mailto:` 链接常唤起用户不使用的系统邮件客户端。
- **设计**:
    - **弹窗内容**: 显示完整 Email 地址。
    - **主要动作**: [一键复制] 按钮，点击后显示“已复制”气泡提示。
    - **次要动作**: [发送邮件] 链接，保留原始 `mailto:` 逻辑。
- **技术**: 使用 `navigator.clipboard.writeText` 实现。

### 2.2 RSS 增强：订阅引导
- **痛点**: 非技术用户点击 RSS 会看到 XML 源码。
- **设计**:
    - **地址展示**: 突出显示 Feed URL 和复制按钮。
    - **订阅引导**: 列出推荐的阅读器（NetNewsWire, Reeder, Feedly）。
    - **状态信息**: (可选) 显示最后更新日期。

### 2.3 Sitemap 增强：内容总览 (Museum Directory)
- **痛点**: 站点地图对普通用户无实际价值。
- **设计**:
    - **创作数据**: 从内容集合中计算并展示：
        - 累计文章总数。
        - 累计创作天数。
        - 总字数（概估）。
    - **快捷分类**: 提供“编程”、“随笔”、“读书”等核心标签的快速跳转链接。

## 3. 技术实现建议

### 3.1 弹窗状态管理
继续扩展 `ModalType` 联合类型：
```typescript
type ModalType = 'none' | 'wechat' | 'github' | 'email' | 'rss' | 'sitemap';
```

### 3.2 布局一致性
所有弹窗应遵循以下视觉规范：
- **容器**: `framer-motion` 的 `layoutId` 动画过渡。
- **背景**: `backdrop-blur-md` 磨砂玻璃效果。
- **关闭**: 底部统一的圆形 [X] 按钮。

### 3.3 数据源 (Sitemap Stats)
对于 Sitemap 的统计数据，建议在 Astro 构建时（`getStaticPaths` 或页面顶部逻辑）计算好，作为 Props 传入 `AboutProfile`，或者通过一个简单的静态 JSON 文件预加载。

## 4. 交互示例 (Email 伪代码)

```tsx
{activeModal === 'email' && (
  <motion.div layoutId="email-card" className="...">
    <Icon icon="tabler:mail" className="..." />
    <h3 className="...">联系我</h3>
    <code className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded">coderfee@outlook.com</code>
    <div className="flex gap-2 mt-4">
      <button onClick={copyEmail}>复制地址</button>
      <a href="mailto:...">去发邮件</a>
    </div>
  </motion.div>
)}
```

---
**建议优先级**: 
1. **Email** (解决高频 UX 问题)
2. **RSS** (提升订阅转化)
3. **Sitemap** (秀出创作量)

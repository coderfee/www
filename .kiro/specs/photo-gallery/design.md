# Design Document

## Overview

照片库功能将为博客添加一个专门的照片展示页面，采用现代化的网格布局和灯箱效果。设计将完全集成到现有的 Astro + React + TailwindCSS 技术栈中，保持与博客整体风格的一致性。

## Architecture

### 技术栈
- **前端框架**: Astro 5.12.0 (静态站点生成)
- **UI 组件**: React 18.3.1 (交互组件)
- **样式系统**: TailwindCSS 4.1.11 + 自定义 CSS
- **图片处理**: Astro 内置图片优化
- **动画**: Framer Motion 12.23.6 (灯箱动画)

### 文件结构
```
src/
├── pages/
│   └── photos.astro                 # 照片库主页面
├── components/
│   └── features/
│       └── photos/
│           ├── PhotoGallery.astro   # 照片网格容器
│           ├── PhotoGrid.tsx        # React 照片网格组件
│           ├── PhotoLightbox.tsx    # React 灯箱组件
│           └── PhotoCard.astro      # 单个照片卡片
├── content/
│   └── photos/
│       ├── config.ts               # 照片集合配置
│       └── gallery/                # 照片数据文件
└── assets/
    └── photos/                     # 照片文件存储
```

## Components and Interfaces

### 1. 照片数据模型

```typescript
// src/content/photos/config.ts
interface PhotoData {
  id: string;
  title: string;
  description?: string;
  image: string;           // 图片路径
  thumbnail?: string;      // 缩略图路径（可选）
  category: string;        // 分类
  tags?: string[];         // 标签
  date: Date;             // 拍摄或上传日期
  alt: string;            // 无障碍描述
  width?: number;         // 原图宽度
  height?: number;        // 原图高度
}

interface PhotoCategory {
  id: string;
  name: string;
  description?: string;
  cover?: string;         // 分类封面图
}
```

### 2. 页面组件架构

```astro
<!-- src/pages/photos.astro -->
---
import BaseLayout from '@/components/layouts/BaseLayout.astro';
import PhotoGallery from '@/components/features/photos/PhotoGallery.astro';
import { getCollection } from 'astro:content';

const photos = await getCollection('photos');
const categories = [...]; // 从照片中提取分类
---

<BaseLayout title="照片库" description="浏览精选照片集合">
  <PhotoGallery photos={photos} categories={categories} />
</BaseLayout>
```

### 3. 核心组件设计

#### PhotoGallery.astro (容器组件)
- 负责页面布局和服务端数据处理
- 集成导航和页面标题
- 传递数据给 React 交互组件

#### PhotoGrid.tsx (React 网格组件)
```typescript
interface PhotoGridProps {
  photos: PhotoData[];
  categories: PhotoCategory[];
}

// 功能特性:
// - 响应式网格布局 (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
// - 图片懒加载 (Intersection Observer)
// - 分类筛选
// - 无限滚动或分页
// - 加载状态和错误处理
```

#### PhotoLightbox.tsx (React 灯箱组件)
```typescript
interface PhotoLightboxProps {
  photos: PhotoData[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

// 功能特性:
// - 全屏灯箱显示
// - 键盘导航 (ESC, 左右箭头)
// - 触摸手势支持
// - 图片预加载
// - 动画过渡效果
// - 背景滚动锁定
```

## Data Models

### 照片内容集合配置

```typescript
// src/content/config.ts 扩展
import { defineCollection, z } from 'astro:content';

const photosCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string(),
    thumbnail: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    date: z.date(),
    alt: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  newsletter: newsletterCollection,
  photos: photosCollection, // 新增照片集合
};
```

### 照片数据文件示例

```json
// src/content/photos/gallery/photo-001.json
{
  "title": "日落时分",
  "description": "在海边拍摄的美丽日落",
  "image": "/src/assets/photos/sunset-001.jpg",
  "category": "风景",
  "tags": ["日落", "海边", "自然"],
  "date": "2024-06-15",
  "alt": "海边日落景色，天空呈现橙红色渐变"
}
```

## Error Handling

### 图片加载错误处理
1. **加载失败**: 显示默认占位图片
2. **网络错误**: 提供重试机制
3. **格式不支持**: 显示错误提示

### 用户体验错误处理
1. **空状态**: 当没有照片时显示友好提示
2. **分类为空**: 显示"该分类暂无照片"
3. **搜索无结果**: 提供搜索建议

### 性能优化错误处理
1. **大图片**: 自动压缩和优化
2. **加载超时**: 设置合理的超时时间
3. **内存溢出**: 限制同时加载的图片数量

## Testing Strategy

### 1. 单元测试
- 照片数据模型验证
- 组件渲染测试
- 工具函数测试

### 2. 集成测试
- 页面路由测试
- 数据获取测试
- 组件交互测试

### 3. 端到端测试
- 照片库页面访问
- 灯箱功能测试
- 分类筛选测试
- 响应式布局测试

### 4. 性能测试
- 图片加载性能
- 懒加载效果验证
- 内存使用监控

### 5. 无障碍测试
- 键盘导航测试
- 屏幕阅读器兼容性
- 颜色对比度检查
- 焦点管理测试

## 设计规范

### 视觉设计
- **网格间距**: gap-4 (16px)
- **圆角**: rounded-lg (8px)
- **阴影**: shadow-lg 悬停效果
- **过渡**: transition-all duration-300

### 响应式断点
- **移动端**: 1列 (< 768px)
- **平板**: 2列 (768px - 1024px)  
- **桌面**: 3列 (1024px - 1280px)
- **大屏**: 4列 (> 1280px)

### 颜色方案
- 继承博客现有的暗色/亮色主题
- 使用 `bg-white dark:bg-zinc-900` 背景
- 使用 `text-zinc-600 dark:text-zinc-300` 文字颜色

### 动画效果
- **卡片悬停**: scale-105 + shadow 增强
- **灯箱打开**: fade-in + scale 动画
- **图片切换**: slide 过渡效果
- **加载状态**: skeleton 动画
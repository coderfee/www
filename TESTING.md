# 测试指南

## 测试策略

本项目采用多层次的测试策略，确保代码质量和功能可靠性：

- **单元测试**：验证独立函数和组件的逻辑
- **集成测试**：验证组件间的交互
- **端到端测试**：验证完整的用户流程
- **静态分析**：使用 TypeScript 和 Biome 进行代码质量检查

## 当前测试状态

目前项目中尚未包含自动化测试套件。建议按照以下指南逐步建立测试覆盖：

### 需要测试的关键组件

1. **内容同步脚本 (`sync-r2.mjs`)**
   - 验证与 R2 存储的连接
   - 验证文件同步逻辑
   - 验证错误处理机制

2. **业务服务 (`src/services/`)**
   - API 请求处理
   - 数据转换和验证
   - 错误处理逻辑

3. **组件功能**
   - React 组件的交互逻辑
   - Astro 页面的渲染
   - 搜索功能（Pagefind 集成）

## 测试工具选择

### 推荐的测试框架

1. **Vitest** - 快速的测试运行器，与 Vite/Astro 集成良好
2. **React Testing Library** - 用于测试 React 组件
3. **Playwright** - 用于端到端测试
4. **Cypress** - 替代的端到端测试方案

### 工具安装示例

```bash
# 安装测试依赖
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom

# 安装端到端测试工具（选择其一）
pnpm add -D @playwright/test
# 或
pnpm add -D cypress
```

## 单元测试

### 基本结构

```typescript
// 示例：测试工具函数
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-01-01');
    const result = formatDate(date);
    expect(result).toBe('2023年1月1日');
  });
});
```

### 测试异步函数

```typescript
// 示例：测试异步函数
import { describe, it, expect, vi } from 'vitest';
import { fetchBlogPosts } from '@/services/blog';

describe('fetchBlogPosts', () => {
  it('should fetch blog posts successfully', async () => {
    // 模拟 API 响应
    const mockResponse = [{ id: 1, title: 'Test Post' }];
    vi.mock('@/services/blog', () => ({
      fetchBlogPosts: vi.fn().mockResolvedValue(mockResponse)
    }));

    const result = await fetchBlogPosts();
    expect(result).toEqual(mockResponse);
  });
});
```

## 组件测试

### React 组件测试

```tsx
// 示例：测试 React 组件
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';

describe('Header Component', () => {
  it('should render correctly', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
```

### Astro 组件测试

Astro 组件的测试可能需要特殊的设置，可以考虑使用快照测试：

```typescript
// 示例：测试 Astro 组件渲染
import { describe, it, expect } from 'vitest';
import { render } from '@astrojs/test-utils';

describe('Astro Component', () => {
  it('should render correctly', async () => {
    const result = await render({ /* Astro 组件 */ });
    expect(result).toMatchSnapshot();
  });
});
```

## 端到端测试

### Playwright 示例

```typescript
// example.spec.ts
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('http://localhost:4321');

  await expect(page).toHaveTitle(/coderfee/);
});

test('navigation works', async ({ page }) => {
  await page.goto('http://localhost:4321');

  await page.click('text=博客');
  await expect(page).toHaveURL(/blog/);
});
```

## 测试配置

### Vitest 配置 (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### 测试设置文件 (`vitest.setup.ts`)

```typescript
import '@testing-library/jest-dom/vitest';
```

## 测试运行脚本

在 `package.json` 中添加测试脚本：

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## 测试覆盖率

### 配置覆盖率报告

```bash
pnpm add -D @vitest/coverage-v8
```

在 `vitest.config.ts` 中添加覆盖率配置：

```typescript
export default defineConfig({
  test: {
    // ... 其他配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        'coverage',
        'vitest.config.ts',
        'vitest.setup.ts'
      ]
    }
  }
});
```

## 测试最佳实践

### 测试命名约定

- 使用清晰、描述性的测试名称
- 遵循 "should [行为] when [条件]" 模式
- 例如：`should render title when page loads`

### 测试数据管理

- 使用测试数据工厂创建测试数据
- 避免在测试中使用硬编码的值
- 为不同测试场景创建不同的测试数据集

### Mock 和 Stub

- Mock 外部 API 调用
- Stub 复杂的依赖项
- 使用真实数据进行集成测试

### 异步测试

- 正确处理异步操作
- 使用 `async/await` 或 `.then()`
- 避免使用 `setTimeout` 进行等待

## CI/CD 集成

### GitHub Actions 配置示例

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test:run
      
      - name: Run type check
        run: pnpm tsc --noEmit
      
      - name: Run linting
        run: pnpm check
```

## 性能测试

### 基准测试

对于性能关键的函数，可以添加基准测试：

```typescript
import { bench, describe } from 'vitest';
import { expensiveFunction } from '@/lib/utils';

describe('Performance', () => {
  bench('expensiveFunction', () => {
    expensiveFunction(largeDataSet);
  });
});
```

## 测试维护

### 测试审查

- 定期审查和更新测试
- 确保测试反映当前的功能需求
- 删除过时的测试

### 技术债务

- 为现有功能添加测试覆盖
- 逐步提高测试覆盖率
- 优先测试核心业务逻辑

## 测试环境

### 开发环境

- 使用 `vitest` 进行快速反馈
- 启用监视模式进行持续测试
- 使用测试 UI 进行可视化测试运行

### 生产准备

- 确保所有测试通过后才进行部署
- 设置最小测试覆盖率阈值
- 在部署前运行完整的测试套件
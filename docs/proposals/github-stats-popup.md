# 实现方案：GitHub 免验证统计弹窗 (Token-free)

**日期**: 2026-02-02
**状态**: 优化中
**目标**: 为 GitHub 链接增加一个点击触发的统计弹窗，展示核心数据并提供主页跳转入口。

## 1. 核心数据范围 (无需 Token)

- **Public Repos**: 公开仓库数量。
- **Total Stars**: 所有公开仓库获得的星数总和。
- **Followers**: 关注者人数。
- **Account Age**: 加入 GitHub 的年份。

## 2. 技术实现

### 2.1 24 小时超长缓存
由于 GitHub 统计数据变动频率较低，我们将缓存时间设为 24 小时，最大限度节省配额。

```typescript
// src/lib/github.ts
export async function getGitHubStats(username: string) {
  const CACHE_KEY = `gh_stats_v2_${username}`;
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时缓存

  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  }

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    const user = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await reposRes.json();
    const totalStars = repos.reduce((acc: number, r: any) => acc + r.stargazers_count, 0);

    const stats = {
      repos: user.public_repos,
      followers: user.followers,
      stars: totalStars,
      since: new Date(user.created_at).getFullYear(),
      avatar: user.avatar_url,
      name: user.name || username
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: stats, timestamp: Date.now() }));
    return stats;
  } catch (error) {
    return null;
  }
}
```

### 2.2 交互逻辑
- **点击触发**: 用户点击 `AboutProfile` 中的 GitHub 链接时，不再直接跳转，而是通过 `e.preventDefault()` 拦截并弹出此弹窗。
- **关闭方式**: 点击背景遮罩、点击关闭按钮或点击弹窗内的跳转链接。

### 2.3 UI 设计 (弹窗内含跳转按钮)

弹窗将包含一个清晰的“访问 GitHub 主页”按钮。

- **弹窗结构**:
  - **Header**: 用户头像 + 名字 + 加入年份。
  - **Stats Grid**: 四宫格展示 Repos, Stars, Followers 等。
  - **Action**: 一个宽大的、品牌色的 `<a>` 标签按钮，点击后跳转至 `https://github.com/coderfee`。

```tsx
// 示例跳转按钮样式
<a
  href="https://github.com/coderfee"
  target="_blank"
  className="w-full py-3 bg-[#24292e] hover:bg-[#1b1f23] text-white rounded-xl text-center font-medium transition-colors"
>
  访问 GitHub 主页
</a>
```

## 3. 实现细节建议

1. **多弹窗管理**: 由于目前已有微信二维码弹窗，建议在 `AboutProfile.tsx` 中使用一个联合类型状态来管理弹窗：`type ModalType = 'none' | 'wechat' | 'github';`。
2. **数据预加载**: 在页面加载时即可调用一次 API（如果缓存过期），这样用户点击时能秒开，无需等待 Loading。

---
**当前行动**: 文档已就绪，可开始在 `src/lib/github.ts` 和 `src/components/AboutProfile.tsx` 中实施代码。

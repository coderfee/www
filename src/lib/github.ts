export interface GitHubStats {
  repos: number;
  followers: number;
  stars: number;
  since: number;
  avatar: string;
  name: string;
}

/**
 * 获取 GitHub 用户统计信息（免 Token 版）
 * 包含 24 小时本地缓存策略以节省 API 配额
 */
export async function getGitHubStats(username: string): Promise<GitHubStats | null> {
  const CACHE_KEY = `gh_stats_v2_${username}`;
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小时缓存

  // 1. 尝试从缓存读取
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to read GitHub stats cache', e);
  }

  // 2. 抓取新数据
  try {
    // 获取用户基本信息
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error('Failed to fetch user data');
    const user = await userRes.json();

    // 获取仓库信息（计算 Stars）
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    if (!reposRes.ok) throw new Error('Failed to fetch repos data');
    const repos: { stargazers_count: number }[] = await reposRes.json();

    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

    const stats: GitHubStats = {
      repos: user.public_repos,
      followers: user.followers,
      stars: totalStars,
      since: new Date(user.created_at).getFullYear(),
      avatar: user.avatar_url,
      name: user.name || username,
    };

    // 3. 写入缓存
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: stats, timestamp: Date.now() }));
    return stats;
  } catch (error) {
    console.error('GitHub API Error:', error);
    return null;
  }
}

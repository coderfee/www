export interface GitHubStats {
  repos: number;
  followers: number;
  stars: number;
  since: number;
  avatar: string;
  name: string;
}

export async function getGitHubStats(username: string): Promise<GitHubStats | null> {
  const CACHE_KEY = `gh_stats_v2_${username}`;
  const CACHE_TTL = 24 * 60 * 60 * 1000;

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

  try {
    const res = await fetch(`/api/github/stats?username=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error('Failed to fetch GitHub stats');

    const { data } = (await res.json()) as { data: GitHubStats };

    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (error) {
    console.error('GitHub API Error:', error);
    return null;
  }
}

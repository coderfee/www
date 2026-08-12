export interface GitHubStats {
  repos: number;
  followers: number;
  stars: number;
  since: number;
  avatar: string;
  name: string;
}

export async function getGitHubStats(username: string): Promise<GitHubStats | null> {
  try {
    const res = await fetch(`/api/github/stats?username=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error('Failed to fetch GitHub stats');

    const { data } = (await res.json()) as { data: GitHubStats };
    return data;
  } catch (error) {
    console.error('GitHub API Error:', error);
    return null;
  }
}

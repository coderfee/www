import { persistentMap } from '@nanostores/persistent';

export const viewCounts = persistentMap<Record<string, string>>('view-counts:', {});

const getApiUrl = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? 'http://localhost:8787/api/blog/views' : 'https://api.coderfee.com/api/blog/views';
};

export async function fetchViewCounts() {
  try {
    const url = getApiUrl();
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch view counts');

    const result = (await res.json()) as { success: boolean; data: Record<string, number> };
    if (!result.success) throw new Error('API response unsuccessful');

    const data = result.data;
    const currentCounts = viewCounts.get();
    const formattedData: Record<string, string> = { ...currentCounts };

    for (const [key, value] of Object.entries(data)) {
      const normalizedKey = key.replace(/\/$/, '');
      const apiValue = Number(value);
      const localValue = Number(currentCounts[normalizedKey] || 0);
      formattedData[normalizedKey] = String(Math.max(apiValue, localValue));
    }

    viewCounts.set(formattedData);
  } catch (error) {
    console.error('[ViewCounts Store] Failed to fetch view counts:', error);
  }
}

export function incrementViewCount(slug: string) {
  const currentCounts = viewCounts.get();
  const currentCount = Number(currentCounts[slug] || 0);
  viewCounts.setKey(slug, String(currentCount + 1));
}

export function reportView(slug: string, title: string) {
  incrementViewCount(slug);

  const url = getApiUrl();
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, title }),
    keepalive: true,
  }).catch(() => {});
}

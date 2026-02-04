import { persistentMap } from '@nanostores/persistent';

export const viewCounts = persistentMap<Record<string, string>>('view-counts:', {});

const getApiUrl = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? 'http://localhost:3000/api/public/visit' : 'https://dash.coderfee.com/api/public/visit';
};

export async function fetchViewCounts() {
  try {
    const url = getApiUrl();
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch view counts');

    const data = (await res.json()) as Record<string, number>;
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

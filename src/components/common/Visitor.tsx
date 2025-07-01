import { useEffect, useState } from 'react';
import { view } from '@/services';

export default function Visitor({ slug, title }) {
  const [viewCount, setViewCount] = useState(0);

  async function recordVisit() {
    const res = await view({ slug, title });
    setViewCount(res.data || 0);
  }

  useEffect(() => {
    recordVisit();
  });

  return <>{viewCount}</>;
}

import { useCallback, useEffect, useState } from 'react';
import { view } from '@/services';

export default function Visitor({ slug, title }) {
  const [viewCount, setViewCount] = useState(0);

  const recordVisit = useCallback(async () => {
    const res = await view({ slug, title });
    setViewCount(res.data || 0);
  }, [slug, title]);

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  return <>{viewCount}</>;
}

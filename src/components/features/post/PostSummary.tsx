import { useEffect } from 'react';
import { summary } from '@/services';

export default function PostSummary({ slug, content }) {
  useEffect(() => {
    summary({ slug, content });
  }, [slug, content]);

  return <span>{slug}</span>;
}

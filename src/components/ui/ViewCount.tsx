import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { viewCounts } from '@/lib/store/view-counts';

interface Props {
  slug: string;
  className?: string;
}

export default function ViewCount({ slug, className = '' }: Props) {
  const [countStr, setCountStr] = useState<string | undefined>(viewCounts.get()[slug]);

  useEffect(() => {
    const unsubscribe = viewCounts.subscribe((value) => {
      setCountStr(value[slug]);
    });
    return () => unsubscribe();
  }, [slug]);

  if (!countStr) {
    return null;
  }

  const count = Number(countStr);

  return (
    <div
      className={`inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-500 tabular-nums ${className}`}
    >
      <Icon icon="tabler:eye" className="w-3.5 h-3.5" />
      <span>{count.toLocaleString()}</span>
    </div>
  );
}

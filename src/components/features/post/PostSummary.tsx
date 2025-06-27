import { summary } from '@/services';
import { useEffect } from 'react';

type PostSummaryProps = {
  slug: string;
  content?: string;
};

export default function PostSummary({ slug, content }: PostSummaryProps) {
  useEffect(() => {
    summary({ slug, content });
  });

  return <></>;
}

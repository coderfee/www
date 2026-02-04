'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  title: string;
  url?: string;
  description?: string;
}

export default function ShareButton({ title, url, description }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    const shareUrl = url || window.location.href;
    const shareTextContent = description || '';

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareTextContent,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (_err) {}
  };

  return (
    <div className="hidden md:flex justify-center my-8">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full
                 bg-white dark:bg-zinc-900
                 border border-zinc-200 dark:border-zinc-700
                 hover:bg-zinc-100 dark:hover:bg-zinc-800
                 text-zinc-600 dark:text-zinc-400
                 transition-colors cursor-pointer"
        aria-label="分享文章"
      >
        <Icon icon="tabler:share" className="w-4 h-4" />
        <span className="text-sm font-medium min-w-[60px] h-[20px] overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isCopied ? 'copied' : 'share'}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {isCopied ? '链接已复制' : '分享文章'}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>
    </div>
  );
}

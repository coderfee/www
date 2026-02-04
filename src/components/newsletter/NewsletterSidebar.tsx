'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface Props {
  issue: number;
}

export default function NewsletterSidebar({ issue }: Props) {
  return (
    <aside className="hidden lg:flex lg:w-20 lg:sticky lg:top-28 lg:flex-col items-center py-2 h-fit transform-gpu backface-hidden">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => window.history.back()}
        className="mb-12 p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all hover:scale-110 active:scale-95 group shadow-sm flex items-center justify-center"
        title="返回列表"
      >
        <Icon icon="tabler:arrow-left" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </motion.button>

      <div className="lg:[writing-mode:vertical-rl] flex items-center gap-6">
        <span className="font-noto italic text-6xl font-black text-zinc-100 dark:text-zinc-800/50 select-none tracking-tighter">
          ISSUE #{issue.toString().padStart(2, '0')}
        </span>
        <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-800/80"></div>
        <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-400 dark:text-zinc-500 uppercase whitespace-nowrap">
          Newsletter
        </p>
      </div>
    </aside>
  );
}

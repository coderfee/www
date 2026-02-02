import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { TRANSITION } from '../types';

interface Props {
  layoutId: string;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalWrapper({ layoutId, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/20 dark:bg-black/40 backdrop-blur-md"
      />

      <motion.div
        layoutId={layoutId}
        transition={TRANSITION}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-8 flex flex-col">{children}</div>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          type="button"
          onClick={onClose}
          className="absolute left-1/2 -translate-x-1/2 -bottom-16 size-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 border border-zinc-800/10 dark:border-white/10"
        >
          <Icon icon="tabler:x" className="text-2xl" />
        </motion.button>
      </motion.div>
    </div>
  );
}

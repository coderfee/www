'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Heading } from './TableOfContents';
import { useScrollSpy } from './useScrollSpy';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  headings: Heading[];
}

export default function MobileTOCDrawer({ isOpen, onClose, headings }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when open (optional for popover, but good for focus)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const tocHeadings = headings ? headings.filter((h) => h.depth > 1 && h.depth <= 3) : [];
  const { activeId } = useScrollSpy(headings);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            style={{ left: '50%' }}
            className="absolute bottom-24 w-[calc(100%-2rem)] max-w-xs
                       bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl
                       rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                       border border-zinc-200/50 dark:border-white/10
                       overflow-hidden flex flex-col max-h-[50vh]"
          >
            <div className="p-4 border-b border-zinc-100/50 dark:border-white/5 flex items-center justify-between shrink-0">
              <span className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Content</span>
              <span className="text-[10px] bg-zinc-100 dark:bg-white/10 text-zinc-500 px-1.5 py-0.5 rounded-md">
                {tocHeadings.length}
              </span>
            </div>

            <div className="overflow-y-auto py-2 overscroll-contain">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full text-left flex items-center gap-3 px-5 py-3 text-[14px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors active:bg-zinc-100 dark:active:bg-white/5 active:scale-[0.98]"
              >
                <div className="w-5 flex items-center justify-center">
                  <Icon icon="tabler:arrow-bar-to-up" className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <span>回到顶部</span>
              </button>

              <div className="h-px bg-zinc-100/50 dark:bg-white/5 mx-5 my-1" />

              {tocHeadings.length > 0 ? (
                tocHeadings.map((heading) => {
                  const isActive = activeId === heading.slug;
                  return (
                    <a
                      key={heading.slug}
                      href={`#${heading.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        const element = document.getElementById(heading.slug);
                        if (element) {
                          const y = element.getBoundingClientRect().top + window.scrollY - 80;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                      className={`
                        block px-5 py-3 text-[14px] transition-all
                        ${heading.depth === 3 ? 'pl-8' : ''}
                        ${
                          isActive
                            ? 'bg-zinc-100/80 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 font-semibold'
                            : 'text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-50 dark:hover:bg-white/5'
                        }
                        active:scale-[0.98]
                      `}
                    >
                      {heading.text}
                    </a>
                  );
                })
              ) : (
                <p className="text-center text-zinc-400 py-6 text-sm">暂无目录</p>
              )}
            </div>

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/85 dark:bg-zinc-900/85 rotate-45 border-r border-b border-zinc-200/50 dark:border-white/10 -z-10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

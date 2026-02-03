'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '@/lib/hooks';
import { useScrollSpy } from './useScrollSpy';
import { useTOCActions } from './useTOCActions';

export type Heading = {
  depth: number;
  slug: string;
  text: string;
};

interface DesktopProps {
  headings: Heading[];
}

export function TOCDesktop({ headings }: DesktopProps) {
  const tocHeadings = useMemo(() => headings.filter((h) => h.depth > 1 && h.depth <= 3), [headings]);
  const { activeId, setActiveId, isClickingRef } = useScrollSpy(tocHeadings);
  const { scrollTo, scrollToTop, scrollToComments } = useTOCActions(setActiveId, isClickingRef);

  if (headings.length === 0 || tocHeadings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-3 py-4"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          scrollToTop();
        }}
        className="group relative flex items-center justify-end py-1 px-2"
        aria-label="回到顶部"
      >
        <span
          className="absolute right-full mr-3 whitespace-nowrap text-xs font-medium px-2 py-1 rounded bg-zinc-900/90 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm
            transition-all duration-300 origin-right pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
        >
          回到顶部
        </span>

        <div className="w-5 flex items-center justify-center">
          <Icon
            icon="tabler:arrow-bar-to-up"
            className="w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
          />
        </div>
      </button>

      {tocHeadings.map((heading) => {
        const isActive = activeId === heading.slug;
        const isH3 = heading.depth === 3;

        return (
          <a
            key={heading.slug}
            href={`#${heading.slug}`}
            onClick={(e) => {
              e.preventDefault();
              scrollTo(heading.slug);
            }}
            className="group relative flex items-center justify-end py-1 px-2 transition-transform"
            aria-label={`跳转到 ${heading.text}`}
            aria-current={isActive ? 'location' : undefined}
          >
            <span
              className={`
                absolute right-full mr-3 whitespace-nowrap text-xs font-medium px-2 py-1 rounded bg-zinc-900/90 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm
                transition-all duration-300 origin-right pointer-events-none
                ${isActive ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}
              `}
            >
              {heading.text}
            </span>

            <div className="w-5 flex items-center justify-center">
              <span
                className={`
                  block transition-all duration-300 rounded-full
                  ${
                    isActive
                      ? 'w-1.5 h-6 bg-zinc-900 dark:bg-zinc-100'
                      : `${isH3 ? 'w-1 h-1' : 'w-1.5 h-1.5'} bg-zinc-300 dark:bg-zinc-600 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-500 group-hover:scale-125`
                  }
                  ${isH3 && !isActive ? 'opacity-60' : ''}
                `}
              />
            </div>
          </a>
        );
      })}

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          scrollToComments();
        }}
        className="group relative flex items-center justify-end py-1 px-2"
        aria-label="跳转到评论"
      >
        <span
          className="absolute right-full mr-3 whitespace-nowrap text-xs font-medium px-2 py-1 rounded bg-zinc-900/90 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm
            transition-all duration-300 origin-right pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
        >
          跳转到评论
        </span>

        <div className="w-5 flex items-center justify-center">
          <Icon
            icon="tabler:message-2"
            className="w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
          />
        </div>
      </button>
    </nav>
  );
}

interface MobileProps {
  isOpen: boolean;
  onClose: () => void;
  headings: Heading[];
}

export function TOCMobile({ isOpen, onClose, headings }: MobileProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(isOpen);

  const tocHeadings = useMemo(() => (headings ? headings.filter((h) => h.depth > 1 && h.depth <= 3) : []), [headings]);
  const { activeId } = useScrollSpy(tocHeadings);
  const { scrollTo, scrollToTop, scrollToComments } = useTOCActions(undefined, undefined, onClose);

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
                  scrollToTop();
                }}
                className="w-full text-left flex items-center gap-3 px-5 py-3 text-[14px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors active:bg-zinc-100 dark:active:bg-white/5 active:scale-[0.98]"
              >
                <div className="w-5 flex items-center justify-center">
                  <Icon icon="tabler:arrow-bar-to-up" className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <span>回到顶部</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToComments();
                }}
                className="w-full text-left flex items-center gap-3 px-5 py-3 text-[14px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors active:bg-zinc-100 dark:active:bg-white/5 active:scale-[0.98]"
              >
                <div className="w-5 flex items-center justify-center">
                  <Icon icon="tabler:message-2" className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <span>跳转到评论</span>
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
                        scrollTo(heading.slug);
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default TOCDesktop;

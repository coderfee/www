'use client';

import { Icon } from '@iconify/react';
import { useScrollSpy } from './useScrollSpy';

export type Heading = {
  depth: number;
  slug: string;
  text: string;
};

interface Props {
  headings: Heading[];
}

export default function TableOfContents({ headings }: Props) {
  const { activeId, setActiveId, isClickingRef } = useScrollSpy(headings);

  if (headings.length === 0) return null;

  const tocHeadings = headings.filter((h) => h.depth > 1 && h.depth <= 3);

  if (tocHeadings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLElement>, slug: string) => {
    e.preventDefault();
    isClickingRef.current = true;
    setActiveId(slug);

    const element = document.getElementById(slug);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });

      setTimeout(() => {
        isClickingRef.current = false;
      }, 800);
    } else {
      isClickingRef.current = false;
    }
  };

  const handleScrollToTop = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    isClickingRef.current = true;
    setActiveId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      isClickingRef.current = false;
    }, 800);
  };

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-3 py-4"
    >
      <button
        type="button"
        onClick={handleScrollToTop}
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
            onClick={(e) => handleClick(e, heading.slug)}
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
    </nav>
  );
}

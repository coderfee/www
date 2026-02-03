'use client';

import { useEffect, useRef, useState } from 'react';
import type { Heading } from './TableOfContents';

export function useScrollSpy(headings: Heading[]) {
  const [activeId, setActiveId] = useState<string>('');
  const isClickingRef = useRef(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const getHeadingElements = () => {
      return headings
        .map((h) => ({
          id: h.slug,
          element: document.getElementById(h.slug),
        }))
        .filter((item) => item.element !== null);
    };

    const handleScroll = () => {
      if (isClickingRef.current) return;

      const elements = getHeadingElements();
      if (elements.length === 0) return;

      const threshold = 100;
      let currentActiveId = '';

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i].element;
        if (!element) continue;

        const rect = element.getBoundingClientRect();

        if (rect.top <= threshold) {
          currentActiveId = elements[i].id;
        } else {
          break;
        }
      }

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      if (isAtBottom && elements.length > 0) {
        currentActiveId = elements[elements.length - 1].id;
      }

      setActiveId(currentActiveId);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [headings]);

  return { activeId, setActiveId, isClickingRef };
}

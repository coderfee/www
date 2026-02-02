'use client';

import { useEffect, useRef, useState } from 'react';
import type { Heading } from './TableOfContents';

export function useScrollSpy(headings: Heading[]) {
  const [activeId, setActiveId] = useState<string>('');
  const isClickingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isClickingRef.current) return;

      const headingElements = headings.map((h) => ({
        id: h.slug,
        element: document.getElementById(h.slug),
      }));

      let currentActiveId = '';

      for (const { id, element } of headingElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top < 150) {
            currentActiveId = id;
          } else {
            break;
          }
        }
      }

      setActiveId(currentActiveId);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  return { activeId, setActiveId, isClickingRef };
}

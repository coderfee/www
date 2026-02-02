'use client';

import { useEffect, useRef, useState } from 'react';
import type { Heading } from './TableOfContents';

/**
 * Custom hook to track the active heading based on scroll position.
 * It finds the last heading that is above a certain threshold (150px) from the top.
 */
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

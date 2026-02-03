'use client';

import { type RefObject, useCallback } from 'react';

export function useTOCActions(
  setActiveId?: (id: string) => void,
  isClickingRef?: RefObject<boolean>,
  onClose?: () => void,
) {
  const scrollTo = useCallback(
    (id: string, offset = 80) => {
      if (onClose) onClose();
      if (isClickingRef) (isClickingRef as { current: boolean }).current = true;
      if (setActiveId) setActiveId(id);

      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });

        if (isClickingRef) {
          setTimeout(() => {
            (isClickingRef as { current: boolean }).current = false;
          }, 800);
        }
      } else if (isClickingRef) {
        (isClickingRef as { current: boolean }).current = false;
      }
    },
    [onClose, setActiveId, isClickingRef],
  );

  const scrollToTop = useCallback(() => {
    if (onClose) onClose();
    if (isClickingRef) (isClickingRef as { current: boolean }).current = true;
    if (setActiveId) setActiveId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isClickingRef) {
      setTimeout(() => {
        (isClickingRef as { current: boolean }).current = false;
      }, 800);
    }
  }, [onClose, setActiveId, isClickingRef]);

  const scrollToComments = useCallback(() => {
    scrollTo('comments');
  }, [scrollTo]);

  return { scrollTo, scrollToTop, scrollToComments };
}

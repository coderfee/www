import { useCallback, useEffect } from 'react';
import { type HapticPatternKey, triggerHaptic } from './haptic';

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLocked]);
}

export function useHaptic() {
  const vibrate = useCallback((pattern?: HapticPatternKey | number | number[]) => {
    triggerHaptic(pattern);
  }, []);

  return { vibrate };
}

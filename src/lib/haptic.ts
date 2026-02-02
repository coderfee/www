export const HapticPatterns = {
  light: 10,
  medium: 20,
  success: [10, 30, 10],
  warning: [50, 100, 50],
};

export type HapticPatternKey = keyof typeof HapticPatterns;

export function triggerHaptic(pattern: HapticPatternKey | number | number[] = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const v = typeof pattern === 'string' ? HapticPatterns[pattern] : pattern;
    try {
      navigator.vibrate(v);
    } catch (_e) {
      // 忽略可能的权限或后台限制错误
    }
  }
}

'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

const navItems = [
  { name: '首页', path: '/', icon: 'tabler:smart-home' },
  { name: '归档', path: '/archive', icon: 'tabler:archive' },
  { name: '周刊', path: '/newsletter', icon: 'tabler:book-2' },
];

export default function BottomNavigation() {
  const [activePath, setActivePath] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // 向下滚动超过 150px 且速度较快时隐藏，向上滚动时显示
    if (latest > previous && latest > 150) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  const handleClick = (path: string) => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    setActivePath(path);
  };

  const isActive = (path: string) => {
    if (path === '/' && activePath === path) return true;
    if (path !== '/' && activePath.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-max flex items-center justify-center">
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 25,
            }}
            className="pointer-events-auto bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-1 mb-[env(safe-area-inset-bottom)] flex items-center select-none [touch-callout:none] [-webkit-touch-callout:none] gap-1"
          >
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <motion.a
                  key={item.path}
                  href={item.path}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleClick(item.path)}
                  className={`flex flex-col items-center justify-center min-w-[80px] h-11 rounded-full transition-colors relative overflow-hidden ${
                    active
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.name}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon icon={item.icon} className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium leading-none">{item.name}</span>
                </motion.a>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

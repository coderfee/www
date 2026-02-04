'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

import { useHaptic } from '@/lib/hooks';

const navItems = [
  { name: '首页', path: '/', icon: 'tabler:smart-home' },
  { name: '归档', path: '/archive', icon: 'tabler:archive' },
  { name: '周刊', path: '/newsletter', icon: 'tabler:book-2' },
  { name: '关于', path: '/about', icon: 'tabler:user' },
];

export default function BottomNavigation() {
  const [activePath, setActivePath] = useState('');
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();
  const { vibrate } = useHaptic();

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  const handleClick = (path: string) => {
    vibrate('light');
    setActivePath(path);
    setTimeout(() => {
      window.location.href = path;
    }, 200);
  };

  const isActive = (path: string) => {
    if (path === '/' && activePath === path) return true;
    if (path !== '/' && activePath.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-max flex items-center justify-center">
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
            onMouseLeave={() => setHoveredPath(null)}
            className="pointer-events-auto bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-full border border-zinc-200/50 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-1.5 mb-[env(safe-area-inset-bottom)] flex items-center select-none [touch-callout:none] [-webkit-touch-callout:none] gap-1"
          >
            {navItems.map((item) => {
              const active = isActive(item.path);
              const isHovered = hoveredPath === item.path;
              const showPill = isHovered || (active && hoveredPath === null);

              return (
                <motion.button
                  key={item.path}
                  whileTap={{ scale: 0.96 }}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  onClick={() => handleClick(item.path)}
                  className={`flex flex-col items-center justify-center min-w-16 h-11 rounded-full transition-colors duration-300 relative cursor-pointer z-10 ${
                    active || isHovered ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-500'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.name}
                >
                  {showPill && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-zinc-100/80 dark:bg-white/10 -z-10 rounded-full"
                      transition={{
                        type: 'spring',
                        stiffness: 250,
                        damping: 25,
                        mass: 0.8,
                      }}
                    />
                  )}
                  <Icon
                    icon={item.icon}
                    className={`w-5 h-5 mb-0.5 transition-transform duration-300 ${active ? 'scale-110' : ''}`}
                  />
                  <span className={`text-[10px] leading-none tracking-tight font-medium`}>{item.name}</span>
                </motion.button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

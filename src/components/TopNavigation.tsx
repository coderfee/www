'use client';

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

const navItems = [
  { name: '首页', path: '/' },
  { name: '归档', path: '/archive' },
  { name: '周刊', path: '/newsletter' },
];

interface Props {
  showNavigation?: boolean;
}

export default function TopNavigation({ showNavigation = true }: Props) {
  const [activePath, setActivePath] = useState('');
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  const isActive = (path: string) => {
    if (path === '/' && activePath === path) return true;
    if (path !== '/' && activePath.startsWith(path)) return true;
    return false;
  };

  if (!showNavigation) return null;

  return (
    <motion.header
      id="top-nav"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sticky top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md pt-[env(safe-area-inset-top)] flex-none border-b border-zinc-200/50 dark:border-zinc-800/50"
    >
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <motion.a
          href="/"
          className="flex items-center gap-2 text-base font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors group"
          initial="initial"
          whileHover="hover"
        >
          <img
            src="https://assets.coderfee.com/favicon/www.svg"
            alt="CoderFee"
            className="size-8 group-hover:rotate-12 transition-transform duration-300"
            width="32"
            height="32"
          />
          <motion.span
            className="font-major uppercase text-lg tracking-tight flex"
            variants={{
              hover: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {'coderfee'.split('').map((char, index) => (
              <motion.span
                // biome-ignore lint/suspicious/noArrayIndexKey: Static logo text
                key={`${char}-${index}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                variants={{
                  hover: {
                    y: -4,
                    transition: {
                      duration: 0.2,
                      repeat: 1,
                      repeatType: 'reverse',
                    },
                  },
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </motion.a>

        <nav className="hidden md:flex items-center gap-2 relative" onMouseLeave={() => setHoveredPath(null)}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            const isHovered = hoveredPath === item.path;
            const showDot = isHovered || (active && hoveredPath === null);

            return (
              <a
                key={item.path}
                href={item.path}
                onMouseEnter={() => setHoveredPath(item.path)}
                className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                  active || isHovered ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {showDot && (
                  <motion.div
                    layoutId="top-nav-dot"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 bg-zinc-900 dark:bg-zinc-100 rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                {item.name}
              </a>
            );
          })}
        </nav>
      </nav>
    </motion.header>
  );
}

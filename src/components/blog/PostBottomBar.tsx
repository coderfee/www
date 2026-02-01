'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  title: string;
  description?: string;
  url?: string;
  hasComments?: boolean;
}

export default function PostBottomBar({ title, description, url, hasComments = true }: Props) {
  const [_isLiked, setIsLiked] = useState(false);
  const [shareText, setShareText] = useState('分享');
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const { scrollY } = useScroll();

  const buttonMinWidth = 'min-w-20';

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  useEffect(() => {
    const key = `liked:${window.location.pathname}`;
    setIsLiked(localStorage.getItem(key) === 'true');
  }, []);

  const handleBack = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    history.back();
  };

  const handleScrollToComments = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
  };

  const _handleLike = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    const key = `liked:${window.location.pathname}`;
    const nextLiked = !_isLiked;
    setIsLiked(nextLiked);

    if (nextLiked) {
      localStorage.setItem(key, 'true');
      if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
    } else {
      localStorage.removeItem(key);
    }
  };

  const handleShare = async () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    const shareUrl = url || window.location.href;
    const shareTextContent = description || '';

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareTextContent,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareText('已复制');
        setTimeout(() => {
          setShareText('分享');
        }, 2000);
      }
    } catch (_err) {}
  };

  return (
    <div
      id="post-bottom-nav"
      className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-max flex items-center justify-center"
    >
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
            onMouseLeave={() => setHoveredKey(null)}
            className="pointer-events-auto bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-full border border-zinc-200/50 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-1.5 mb-[env(safe-area-inset-bottom)] flex items-center select-none [touch-callout:none] [-webkit-touch-callout:none] gap-1"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              onMouseEnter={() => setHoveredKey('back')}
              onClick={handleBack}
              className={`flex flex-col items-center justify-center ${buttonMinWidth} h-11 rounded-full transition-colors duration-300 relative cursor-pointer z-10 ${
                hoveredKey === 'back' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-500'
              }`}
              aria-label="返回"
            >
              {hoveredKey === 'back' && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-zinc-100/80 dark:bg-white/10 -z-10 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                  }}
                />
              )}
              <Icon icon="tabler:arrow-left" className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium leading-none tracking-tight">返回</span>
            </motion.button>

            {hasComments && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => setHoveredKey('comments')}
                onClick={handleScrollToComments}
                className={`flex flex-col items-center justify-center ${buttonMinWidth} h-11 rounded-full transition-colors duration-300 relative cursor-pointer z-10 ${
                  hoveredKey === 'comments' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-500'
                }`}
                aria-label="评论"
              >
                {hoveredKey === 'comments' && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-zinc-100/80 dark:bg-white/10 -z-10 rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}
                <Icon icon="tabler:message-circle" className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium leading-none tracking-tight">评论</span>
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              onMouseEnter={() => setHoveredKey('share')}
              onClick={handleShare}
              className={`flex flex-col items-center justify-center ${buttonMinWidth} h-11 rounded-full transition-colors duration-300 relative cursor-pointer z-10 ${
                hoveredKey === 'share' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-500'
              }`}
              aria-label="分享"
            >
              {hoveredKey === 'share' && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-zinc-100/80 dark:bg-white/10 -z-10 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                  }}
                />
              )}
              <Icon icon="tabler:share" className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium leading-none tracking-tight overflow-hidden h-2.5">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={shareText}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    {shareText}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

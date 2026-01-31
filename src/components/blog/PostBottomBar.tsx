'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  title: string;
  description?: string;
  url?: string;
}

export default function PostBottomBar({ title, description, url }: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [shareText, setShareText] = useState('分享');
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // 向下滚动超过 150px 且速度较快时隐藏，向上滚动时显示
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

  const _handleLike = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    const key = `liked:${window.location.pathname}`;
    const nextLiked = !isLiked;
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
    } catch (_err) {
      // Ignore share errors
    }
  };

  return (
    <>
      {/* 顶部进度条 */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-px bg-zinc-500 dark:bg-zinc-400 origin-left z-50"
        style={{ scaleX }}
      />

      <div
        id="post-bottom-nav"
        className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-max flex items-center justify-center"
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
              className="pointer-events-auto bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-1 mb-[env(safe-area-inset-bottom)] flex items-center select-none [touch-callout:none] [-webkit-touch-callout:none] gap-1"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBack}
                className="flex flex-col items-center justify-center min-w-[80px] h-11 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="返回"
              >
                <Icon icon="tabler:arrow-left" className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium leading-none">返回</span>
              </motion.button>

              {/* 暂时隐藏点赞按钮
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={handleLike}
                              className={`flex flex-col items-center justify-center min-w-[80px] h-11 rounded-full transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                                isLiked ? 'text-red-500 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'
                              }`}
                              aria-label="点赞"
                            >
                              <AnimatePresence mode="wait">
                                {isLiked ? (
                                  <motion.div
                                    key="liked"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                  >
                                    <Icon icon="tabler:heart-filled" className="w-5 h-5 mb-0.5" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="unliked"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                  >
                                    <Icon icon="tabler:heart" className="w-5 h-5 mb-0.5" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              <span className="text-[10px] font-medium leading-none">点赞</span>
                            </motion.button>
                            */}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex flex-col items-center justify-center min-w-[80px] h-11 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="分享"
              >
                <Icon icon="tabler:share" className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium leading-none overflow-hidden h-[10px]">
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
    </>
  );
}

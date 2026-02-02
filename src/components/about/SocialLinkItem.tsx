import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useHaptic } from '@/lib/hooks';
import { type SocialLink, TRANSITION } from './types';

interface Props {
  link: SocialLink;
  onClick: () => void;
}

export default function SocialLinkItem({ link, onClick }: Props) {
  const { vibrate } = useHaptic();

  const layoutId = link.isQR
    ? 'wechat-modal'
    : link.isGitHub
      ? 'github-modal'
      : link.isEmail
        ? 'email-modal'
        : link.isRSS
          ? 'rss-modal'
          : link.isSitemap
            ? 'sitemap-modal'
            : undefined;

  return (
    <motion.a
      href={link.url}
      layoutId={layoutId}
      transition={TRANSITION}
      target={link.isEmail || link.isRSS || link.isSitemap ? '_self' : '_blank'}
      aria-label={`访问 ${link.name}: ${link.desc}`}
      rel="noopener"
      onClick={(e) => {
        vibrate('light');
        if (layoutId) {
          e.preventDefault();
          onClick();
        }
      }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      className={`flex items-center p-3 rounded-2xl transition-colors group cursor-pointer ${link.bgColor}`}
    >
      <Icon
        icon={link.icon}
        className={`text-2xl transition-all duration-300 group-hover:scale-110 shrink-0 ${link.color}`}
      />
      <div className="flex flex-col ml-4 min-w-0">
        <span className="font-medium text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
          {link.name}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{link.desc}</span>
      </div>
      <Icon
        icon="tabler:arrow-right"
        className="ml-auto text-zinc-300/50 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 group-hover:translate-x-1 transition-all shrink-0"
      />
    </motion.a>
  );
}

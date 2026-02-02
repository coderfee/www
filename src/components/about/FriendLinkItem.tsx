import { motion } from 'framer-motion';
import { useHaptic } from '@/lib/hooks';
import { type Friend, TRANSITION } from './types';

interface Props {
  friend: Friend;
  onClick: () => void;
}

export default function FriendLinkItem({ friend, onClick }: Props) {
  const { vibrate } = useHaptic();

  return (
    <motion.a
      href={friend.url}
      layoutId={`friend-${friend.name}`}
      transition={TRANSITION}
      target="_blank"
      rel="noopener"
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      onClick={(e) => {
        e.preventDefault();
        vibrate('light');
        onClick();
      }}
      className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
    >
      <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 p-1" />
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-sm text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
          {friend.name}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{friend.desc}</span>
      </div>
    </motion.a>
  );
}

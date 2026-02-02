import { motion } from 'framer-motion';
import { useHaptic } from '@/lib/hooks';
import { TRANSITION } from './types';

interface Props {
  onClick: () => void;
}

export default function ProfileCard({ onClick }: Props) {
  const { vibrate } = useHaptic();

  return (
    <motion.div
      layoutId="profile-modal"
      transition={TRANSITION}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => {
        vibrate('light');
        onClick();
      }}
      className="md:col-span-2 flex items-center p-4 rounded-3xl bg-zinc-50 dark:bg-white/3 border border-zinc-100 dark:border-white/5 transition-colors group select-none cursor-pointer"
    >
      <div className="relative shrink-0">
        <img
          src="https://assets.coderfee.com/blog/avatar.jpg"
          alt="Avatar"
          className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 object-cover shadow-sm"
        />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full" />
      </div>
      <div className="ml-5 flex flex-col min-w-0">
        <h1 className="font-major text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">coderfee</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs truncate">喜欢阅读，热爱写作，享受编程</p>
      </div>
    </motion.div>
  );
}

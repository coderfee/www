import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHaptic } from '@/lib/hooks';
import type { Friend } from '../types';
import ModalWrapper from './ModalWrapper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
  isCopied: boolean;
  onCopy: () => void;
}

export default function FriendModal({ isOpen, onClose, friend, isCopied, onCopy }: Props) {
  const { vibrate } = useHaptic();
  if (!isOpen || !friend) return null;

  return (
    <ModalWrapper layoutId={`friend-${friend.name}`} onClose={onClose}>
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center">
          <img
            src={friend.avatar}
            alt={friend.name}
            className="size-20 rounded-full border-4 border-zinc-50 dark:border-zinc-800 shadow-xl mb-4"
          />
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{friend.name}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 px-4">{friend.desc}</p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={onCopy}
            className="w-full py-3 px-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl transition-all flex items-center justify-between group"
          >
            <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium truncate mr-4">
              {friend.url.replace('https://', '')}
            </span>
            <div className="size-5 flex items-center justify-center shrink-0">
              <AnimatePresence mode="wait">
                {isCopied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Icon icon="tabler:check" className="text-xl text-green-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Icon
                      icon="tabler:copy"
                      className="text-xl text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
          <a
            href={friend.url}
            target="_blank"
            rel="noopener"
            onClick={() => vibrate('light')}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-2xl text-center font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon icon="tabler:external-link" className="text-xl" />去 ta 的家看看
          </a>
        </div>
      </div>
    </ModalWrapper>
  );
}

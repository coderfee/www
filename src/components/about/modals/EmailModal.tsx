import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { EMAIL_ENCODED } from '@/consts';
import { base64Decode } from '@/lib/helper';
import { useHaptic } from '@/lib/hooks';
import ModalWrapper from './ModalWrapper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isCopied: boolean;
  onCopy: () => void;
}

export default function EmailModal({ isOpen, onClose, isCopied, onCopy }: Props) {
  const { vibrate } = useHaptic();
  if (!isOpen) return null;

  const email = base64Decode(EMAIL_ENCODED);

  return (
    <ModalWrapper layoutId="email-modal" onClose={onClose}>
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center">
          <div className="size-14 rounded-2xl bg-[#0078D4]/10 flex items-center justify-center mb-4">
            <Icon icon="tabler:mail" className="text-3xl text-[#0078D4]" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">给我写信</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 px-4">打个招呼，或者单纯聊聊想法</p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={onCopy}
            className="w-full py-3 px-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl transition-all flex items-center justify-between group"
          >
            <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">{email}</span>
            <div className="size-5 flex items-center justify-center">
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
            href={`mailto:${email}`}
            onClick={() => vibrate('light')}
            className="w-full py-3 bg-[#0078D4] hover:bg-[#006cbd] text-white rounded-2xl text-center font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon icon="tabler:send" className="text-xl" />
            立即发邮件
          </a>
        </div>
      </div>
    </ModalWrapper>
  );
}

import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHaptic } from '@/lib/hooks';
import ModalWrapper from './ModalWrapper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isCopied: boolean;
  onCopy: () => void;
}

export default function RSSModal({ isOpen, onClose, isCopied, onCopy }: Props) {
  const { vibrate } = useHaptic();
  if (!isOpen) return null;

  const readers = [
    { name: 'NetNewsWire', icon: 'tabler:brand-apple' },
    { name: 'Reeder', icon: 'tabler:brand-framer' },
    { name: 'Feedly', icon: 'tabler:rss' },
    { name: 'Readwise', icon: 'tabler:book' },
  ];

  return (
    <ModalWrapper layoutId="rss-modal" onClose={onClose}>
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center">
          <div className="size-14 rounded-2xl bg-[#EE802F]/10 flex items-center justify-center mb-4">
            <Icon icon="tabler:rss" className="text-3xl text-[#EE802F]" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">订阅动态</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 px-4">在阅读器里第一时间看到我的新文章</p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">订阅地址</p>
            <button
              type="button"
              onClick={onCopy}
              className="w-full py-3 px-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl transition-all flex items-center justify-between group"
            >
              <code className="text-sm text-zinc-600 dark:text-zinc-300 font-mono">/rss.xml</code>
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
          </div>
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">好用的阅读器</p>
            <div className="grid grid-cols-2 gap-2">
              {readers.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50"
                >
                  <Icon icon={item.icon} className="text-lg text-zinc-400" />
                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener"
            onClick={() => vibrate('light')}
            className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] font-bold"
          >
            <Icon icon="tabler:file-code" className="text-xl" />
            直接查看 XML
          </a>
        </div>
      </div>
    </ModalWrapper>
  );
}

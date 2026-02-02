import { Icon } from '@iconify/react';
import { useHaptic } from '@/lib/hooks';
import ModalWrapper from './ModalWrapper';

export default function SitemapModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { vibrate } = useHaptic();
  if (!isOpen) return null;

  return (
    <ModalWrapper layoutId="sitemap-modal" onClose={onClose}>
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center">
          <div className="size-14 rounded-2xl bg-[#0D9488]/10 flex items-center justify-center mb-4">
            <Icon icon="tabler:map-2" className="text-3xl text-[#0D9488]" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">内容总览</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 px-4">随便逛逛，看看我都写了些什么</p>
        </div>
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">总共写了</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">60+ 篇</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">坚持了多久</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">9 年+</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">都在聊些什么</p>
            <div className="flex flex-wrap gap-1.5">
              {['编程', '阅读', '生活', 'AI', '随笔'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <a
            href="/sitemap-0.xml"
            target="_blank"
            rel="noopener"
            onClick={() => vibrate('light')}
            className="w-full py-3 bg-[#0D9488] hover:bg-[#0c7a70] text-white rounded-2xl text-center font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon icon="tabler:map-2" className="text-xl" />
            查看完整地图
          </a>
        </div>
      </div>
    </ModalWrapper>
  );
}

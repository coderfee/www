import { Icon } from '@iconify/react';
import ModalWrapper from './ModalWrapper';

export default function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <ModalWrapper layoutId="profile-modal" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src="https://assets.coderfee.com/blog/avatar.jpg"
              alt="Avatar"
              className="size-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 object-cover shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-zinc-900 rounded-full" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-4">coderfee</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">在代码与文字间寻找平衡</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '码龄', value: '9+ 年' },
            { label: '原创博文', value: '60+ 篇' },
            { label: '状态', value: '在线中', color: 'text-green-600 dark:text-green-400' },
            { label: '坐标', value: '北京' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50"
            >
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{item.label}</p>
              <p className={`text-xl font-bold ${item.color || 'text-zinc-900 dark:text-zinc-100'}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {[
            { label: '编程', tags: ['Astro', 'React', 'TypeScript', 'Python'], icon: 'tabler:code' },
            { label: '阅读', tags: ['技术', '科幻', '哲学', '小说'], icon: 'tabler:book' },
            { label: '写作', tags: ['记录思考', '生活在别处'], icon: 'tabler:pencil' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <Icon icon={item.icon} className="text-lg text-zinc-400 shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
}

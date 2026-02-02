import { Icon } from '@iconify/react';
import type { GitHubStats } from '@/lib/github';
import { useHaptic } from '@/lib/hooks';
import ModalWrapper from './ModalWrapper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stats: GitHubStats | null;
}

export default function GitHubModal({ isOpen, onClose, stats }: Props) {
  const { vibrate } = useHaptic();
  if (!isOpen) return null;

  return (
    <ModalWrapper layoutId="github-modal" onClose={onClose}>
      <div className="space-y-6">
        {stats ? (
          <>
            <div className="flex items-center gap-4">
              <img src={stats.avatar} alt={stats.name} className="size-14 rounded-2xl shadow-lg" />
              <div className="text-left">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  加入 GitHub 已经 {new Date().getFullYear() - stats.since} 年啦
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Repos', value: stats.repos, icon: 'tabler:code' },
                { label: 'Stars', value: stats.stars, icon: 'tabler:star', iconColor: 'text-yellow-500' },
                { label: 'Followers', value: stats.followers, icon: 'tabler:users', iconColor: 'text-blue-500' },
                {
                  label: 'Years',
                  value: `${new Date().getFullYear() - stats.since}+`,
                  icon: 'tabler:calendar',
                  iconColor: 'text-green-500',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50"
                >
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-0.5">
                    <Icon icon={item.icon} className={`text-base ${item.iconColor || ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{item.value}</div>
                </div>
              ))}
            </div>
            <a
              href="https://github.com/coderfee"
              target="_blank"
              rel="noopener"
              onClick={() => vibrate('light')}
              className="w-full py-3 bg-[#24292e] hover:bg-[#1b1f23] dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-2xl text-center font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Icon icon="tabler:brand-github" className="text-xl" />
              去主页逛逛
            </a>
          </>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <div className="size-10 border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-800 dark:border-t-zinc-200 rounded-full animate-spin" />
            <p className="text-sm text-zinc-500">正在翻看 GitHub 资料...</p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

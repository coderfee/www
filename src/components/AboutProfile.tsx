import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EMAIL_ENCODED } from '@/consts';
import { type GitHubStats, getGitHubStats } from '@/lib/github';
import { base64Decode } from '@/lib/helper';
import { useBodyScrollLock } from '@/lib/hooks';

type ModalType = 'none' | 'wechat' | 'github' | 'email' | 'rss' | 'sitemap';

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/coderfee',
    icon: 'tabler:brand-github',
    color: 'text-[#181717] dark:text-zinc-100',
    bgColor: 'bg-[#181717]/[0.03] dark:bg-white/[0.05] hover:bg-[#181717]/[0.06] dark:hover:bg-white/[0.08]',
    desc: '我的开源项目',
    isGitHub: true,
  },
  {
    name: 'X',
    url: 'https://x.com/coderfee',
    icon: 'tabler:brand-x',
    color: 'text-zinc-900 dark:text-zinc-100',
    bgColor: 'bg-zinc-900/[0.03] dark:bg-white/[0.05] hover:bg-zinc-900/[0.06] dark:hover:bg-white/[0.08]',
    desc: '碎碎念与日常',
  },
  {
    name: 'Email',
    url: `mailto:${base64Decode(EMAIL_ENCODED)}`,
    icon: 'tabler:mail',
    isEmail: true,
    color: 'text-[#0078D4]',
    bgColor: 'bg-[#0078D4]/[0.05] dark:bg-[#0078D4]/[0.1] hover:bg-[#0078D4]/[0.08] dark:hover:bg-[#0078D4]/[0.15]',
    desc: '保持联系',
  },
  {
    name: '微信公众号',
    url: 'https://assets.coderfee.com/blog/wechat-qrcode.jpg',
    icon: 'tabler:brand-wechat',
    color: 'text-[#07C160]',
    bgColor: 'bg-[#07C160]/[0.05] dark:bg-[#07C160]/[0.1] hover:bg-[#07C160]/[0.08] dark:hover:bg-[#07C160]/[0.15]',
    desc: '深度思考与分享',
    isQR: true,
  },
  {
    name: 'RSS',
    url: '/rss.xml',
    icon: 'tabler:rss',
    isRSS: true,
    color: 'text-[#EE802F]',
    bgColor: 'bg-[#EE802F]/[0.05] dark:bg-[#EE802F]/[0.1] hover:bg-[#EE802F]/[0.08] dark:hover:bg-[#EE802F]/[0.15]',
    desc: '第一时间获取更新',
  },
  {
    name: '内容总览',
    url: '/sitemap-0.xml',
    icon: 'tabler:map-2',
    isSitemap: true,
    color: 'text-[#0D9488]',
    bgColor: 'bg-[#0D9488]/[0.05] dark:bg-[#0D9488]/[0.1] hover:bg-[#0D9488]/[0.08] dark:hover:bg-[#0D9488]/[0.15]',
    desc: '看看我都写了些什么',
  },
];

const friends = [
  {
    name: '清溪奔快',
    url: 'https://blog.ixmoyren.dev/',
    desc: '不管青山碍',
    avatar: 'https://blog.ixmoyren.dev/icons/favicon.svg',
  },
];

const transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
} as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition,
  },
};

export default function AboutProfile() {
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [ghStats, setGhStats] = useState<GitHubStats | null>(null);
  const [copiedType, setCopiedType] = useState<'none' | 'email' | 'rss'>('none');

  useEffect(() => {
    const img = new Image();
    img.src = 'https://assets.coderfee.com/blog/wechat-qrcode.jpg';
    getGitHubStats('coderfee').then(setGhStats);
  }, []);

  useBodyScrollLock(activeModal !== 'none');

  const copyToClipboard = (text: string, type: 'email' | 'rss') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType('none'), 2000);
  };

  const closeModal = () => setActiveModal('none');

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="relative inline-block">
          <img
            src="https://assets.coderfee.com/blog/avatar.jpg"
            alt="Avatar"
            className="w-24 h-24 mx-auto rounded-full bg-zinc-50 dark:bg-zinc-900 object-cover border border-zinc-100 dark:border-zinc-800 shadow-xl"
          />
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-black rounded-full" />
        </div>
        <div>
          <h1 className="font-major text-3xl font-bold text-zinc-900 dark:text-zinc-100">coderfee</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">喜欢阅读，热爱写作，享受编程</p>
        </div>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xs md:max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {socialLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.url}
              layoutId={
                link.isQR
                  ? 'wechat-modal'
                  : link.isGitHub
                    ? 'github-modal'
                    : link.isEmail
                      ? 'email-modal'
                      : link.isRSS
                        ? 'rss-modal'
                        : link.isSitemap
                          ? 'sitemap-modal'
                          : undefined
              }
              target={link.isEmail || link.isRSS || link.isSitemap ? '_self' : '_blank'}
              aria-label={`访问 ${link.name}: ${link.desc}`}
              rel="noopener"
              onClick={(e) => {
                if (link.isQR) {
                  e.preventDefault();
                  setActiveModal('wechat');
                } else if (link.isGitHub) {
                  e.preventDefault();
                  setActiveModal('github');
                } else if (link.isEmail) {
                  e.preventDefault();
                  setActiveModal('email');
                } else if (link.isRSS) {
                  e.preventDefault();
                  setActiveModal('rss');
                } else if (link.isSitemap) {
                  e.preventDefault();
                  setActiveModal('sitemap');
                }
              }}
              variants={itemVariants}
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
          ))}
        </div>
      </motion.section>

      <AnimatePresence>
        {activeModal !== 'none' && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-zinc-950/20 dark:bg-black/40 backdrop-blur-md"
            />

            <motion.div
              layoutId={`${activeModal}-modal`}
              transition={transition}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-sm"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 pb-10 flex flex-col">
                  {activeModal === 'email' && (
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
                          onClick={() => copyToClipboard(base64Decode(EMAIL_ENCODED), 'email')}
                          className="w-full py-3 px-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl transition-all flex items-center justify-between group"
                        >
                          <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">
                            {base64Decode(EMAIL_ENCODED)}
                          </span>
                          <div className="size-5 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                              {copiedType === 'email' ? (
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
                          href={`mailto:${base64Decode(EMAIL_ENCODED)}`}
                          className="w-full py-3 bg-[#0078D4] hover:bg-[#006cbd] text-white rounded-2xl text-center font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Icon icon="tabler:send" className="text-xl" />
                          立即发邮件
                        </a>
                      </div>
                    </div>
                  )}

                  {activeModal === 'rss' && (
                    <div className="text-center space-y-6">
                      <div className="flex flex-col items-center">
                        <div className="size-14 rounded-2xl bg-[#EE802F]/10 flex items-center justify-center mb-4">
                          <Icon icon="tabler:rss" className="text-3xl text-[#EE802F]" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">订阅动态</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 px-4">
                          在阅读器里第一时间看到我的新文章
                        </p>
                      </div>
                      <div className="space-y-5">
                        <div className="space-y-2 text-left">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">订阅地址</p>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('https://coderfee.com/rss.xml', 'rss')}
                            className="w-full py-3 px-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl transition-all flex items-center justify-between group"
                          >
                            <code className="text-sm text-zinc-600 dark:text-zinc-300 font-mono">/rss.xml</code>
                            <div className="size-5 flex items-center justify-center">
                              <AnimatePresence mode="wait">
                                {copiedType === 'rss' ? (
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
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                            好用的阅读器
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { name: 'NetNewsWire', icon: 'tabler:brand-apple' },
                              { name: 'Reeder', icon: 'tabler:brand-framer' },
                              { name: 'Feedly', icon: 'tabler:rss' },
                              { name: 'Readwise', icon: 'tabler:book' },
                            ].map((item) => (
                              <div
                                key={item.name}
                                className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50"
                              >
                                <Icon icon={item.icon} className="text-lg text-zinc-400" />
                                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <a
                          href="/rss.xml"
                          target="_blank"
                          className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] font-bold"
                          rel="noopener"
                        >
                          <Icon icon="tabler:file-code" className="text-xl" />
                          直接查看 XML
                        </a>
                      </div>
                    </div>
                  )}

                  {activeModal === 'wechat' && (
                    <div className="text-center">
                      <div className="size-14 rounded-2xl bg-[#07C160]/10 flex items-center justify-center mb-4 mx-auto">
                        <Icon icon="tabler:brand-wechat" className="text-3xl text-[#07C160]" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">微信公众号</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 px-4">
                        扫一扫，在微信里看我的最新分享
                      </p>
                      <img
                        src="https://assets.coderfee.com/blog/wechat-qrcode.jpg"
                        alt="WeChat QR Code"
                        className="w-44 h-48 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-800 mx-auto object-cover"
                      />
                    </div>
                  )}

                  {activeModal === 'github' && (
                    <div className="space-y-6">
                      {ghStats ? (
                        <>
                          <div className="flex items-center gap-4">
                            <img src={ghStats.avatar} alt={ghStats.name} className="size-14 rounded-2xl shadow-lg" />
                            <div className="text-left">
                              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{ghStats.name}</h3>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                加入 GitHub 已经 {new Date().getFullYear() - ghStats.since} 年啦
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-0.5">
                                <Icon icon="tabler:code" className="text-base" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Repos</span>
                              </div>
                              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{ghStats.repos}</div>
                            </div>
                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-0.5">
                                <Icon icon="tabler:star" className="text-base text-yellow-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Stars</span>
                              </div>
                              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{ghStats.stars}</div>
                            </div>
                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-0.5">
                                <Icon icon="tabler:users" className="text-base text-blue-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Followers</span>
                              </div>
                              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                {ghStats.followers}
                              </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-0.5">
                                <Icon icon="tabler:calendar" className="text-base text-green-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Code Age</span>
                              </div>
                              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                {new Date().getFullYear() - ghStats.since}+
                              </div>
                            </div>
                          </div>
                          <a
                            href="https://github.com/coderfee"
                            target="_blank"
                            rel="noopener"
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
                  )}

                  {activeModal === 'sitemap' && (
                    <div className="text-center space-y-6">
                      <div className="flex flex-col items-center">
                        <div className="size-14 rounded-2xl bg-[#0D9488]/10 flex items-center justify-center mb-4">
                          <Icon icon="tabler:map-2" className="text-3xl text-[#0D9488]" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">内容总览</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 px-4">随便逛逛，看看我都写了些什么</p>
                      </div>
                      <div className="space-y-6 text-left">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                              总共写了
                            </p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">60+ 篇</p>
                          </div>
                          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                              坚持了多久
                            </p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">9 年+</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                            都在聊些什么
                          </p>
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
                          className="w-full py-3 bg-[#0D9488] hover:bg-[#0c7a70] text-white rounded-2xl text-center font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                          rel="noopener"
                        >
                          <Icon icon="tabler:map-2" className="text-xl" />
                          查看完整地图
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                type="button"
                onClick={closeModal}
                className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 size-10 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
              >
                <Icon icon="tabler:x" className="text-xl" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xs md:max-w-2xl mx-auto"
      >
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 px-1">志同道合</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {friends.map((friend) => (
            <motion.a
              key={friend.name}
              href={friend.url}
              target="_blank"
              rel="noopener"
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 p-1"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                  {friend.name}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{friend.desc}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

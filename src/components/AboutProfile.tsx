'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EMAIL_ENCODED } from '@/consts';
import { base64Decode } from '@/lib/helper';

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/coderfee',
    icon: 'tabler:brand-github',
    color: 'text-[#181717] dark:text-zinc-100',
    bgColor: 'bg-[#181717]/[0.03] dark:bg-white/[0.05] hover:bg-[#181717]/[0.06] dark:hover:bg-white/[0.08]',
    desc: 'coderfee',
  },
  {
    name: 'X',
    url: 'https://x.com/coderfee',
    icon: 'tabler:brand-x',
    color: 'text-zinc-900 dark:text-zinc-100',
    bgColor: 'bg-zinc-900/[0.03] dark:bg-white/[0.05] hover:bg-zinc-900/[0.06] dark:hover:bg-white/[0.08]',
    desc: 'coderfee',
  },
  {
    name: 'Email',
    url: 'mailto:',
    icon: 'tabler:mail',
    isEmail: true,
    color: 'text-[#0078D4]',
    bgColor: 'bg-[#0078D4]/[0.05] dark:bg-[#0078D4]/[0.1] hover:bg-[#0078D4]/[0.08] dark:hover:bg-[#0078D4]/[0.15]',
    desc: base64Decode(EMAIL_ENCODED),
  },
  {
    name: '微信公众号',
    url: 'https://assets.coderfee.com/blog/wechat-qrcode.jpg',
    icon: 'tabler:brand-wechat',
    color: 'text-[#07C160]',
    bgColor: 'bg-[#07C160]/[0.05] dark:bg-[#07C160]/[0.1] hover:bg-[#07C160]/[0.08] dark:hover:bg-[#07C160]/[0.15]',
    desc: 'coderfee',
    isQR: true,
  },
  {
    name: 'RSS',
    url: '/rss.xml',
    icon: 'tabler:rss',
    color: 'text-[#EE802F]',
    bgColor: 'bg-[#EE802F]/[0.05] dark:bg-[#EE802F]/[0.1] hover:bg-[#EE802F]/[0.08] dark:hover:bg-[#EE802F]/[0.15]',
    desc: 'folo.is/share/users/coderfee',
  },
  {
    name: 'Sitemap',
    url: '/sitemap-0.xml',
    icon: 'tabler:map-2',
    color: 'text-[#0D9488]',
    bgColor: 'bg-[#0D9488]/[0.05] dark:bg-[#0D9488]/[0.1] hover:bg-[#0D9488]/[0.08] dark:hover:bg-[#0D9488]/[0.15]',
    desc: 'coderfee.com',
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
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    } as const,
  },
};

export default function AboutProfile() {
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = 'https://assets.coderfee.com/blog/wechat-qrcode.jpg';
  }, []);

  useEffect(() => {
    if (showQR) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showQR]);

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
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">阅读 / 写作 / 编程</p>
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
              layoutId={link.isQR ? 'wechat-qr' : undefined}
              target={link.isEmail ? '_self' : '_blank'}
              rel="noopener"
              onClick={(e) => {
                if (link.isEmail) {
                  e.preventDefault();
                  const decodedEmail = base64Decode(EMAIL_ENCODED);
                  window.location.href = `mailto:${decodedEmail}`;
                }
                if (link.isQR) {
                  e.preventDefault();
                  setShowQR(true);
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
        {showQR && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)}
              className="fixed inset-0 bg-zinc-950/20 dark:bg-black/40 backdrop-blur-md"
            />
            <motion.div layoutId="wechat-qr" className="relative w-full max-w-sm">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-8 pt-10 flex flex-col items-center text-center">
                  <div className="size-16 rounded-2xl bg-[#07C160]/10 flex items-center justify-center mb-6">
                    <Icon icon="tabler:brand-wechat" className="text-4xl text-[#07C160]" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">微信公众号</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">扫码关注 coderfee 获取最新动态</p>
                  <img
                    src="https://assets.coderfee.com/blog/wechat-qrcode.jpg"
                    alt="WeChat QR Code"
                    className="w-48 h-48 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800 mb-4"
                  />
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                type="button"
                onClick={() => setShowQR(false)}
                className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 size-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                aria-label="关闭"
              >
                <Icon icon="tabler:x" className="text-2xl" />
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
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 px-1">Friends</h2>
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

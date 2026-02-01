'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { EMAIL_ENCODED } from '@/consts';
import { base64Decode } from '@/lib/helper';

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/coderfee',
    icon: 'tabler:brand-github',
  },
  {
    name: 'X (Twitter)',
    url: 'https://twitter.com/coderfee',
    icon: 'tabler:brand-x',
  },
  {
    name: 'Email',
    url: 'mailto:',
    icon: 'tabler:mail',
    isEmail: true,
  },
  {
    name: 'RSS',
    url: '/rss.xml',
    icon: 'tabler:rss',
  },
  {
    name: 'Sitemap',
    url: '/sitemap-0.xml',
    icon: 'tabler:map-2',
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
              target={link.isEmail ? '_self' : '_blank'}
              rel="noopener"
              onClick={(e) => {
                if (link.isEmail) {
                  e.preventDefault();
                  const decodedEmail = base64Decode(EMAIL_ENCODED);
                  window.location.href = `mailto:${decodedEmail}`;
                }
              }}
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
            >
              <Icon
                icon={link.icon}
                className="text-2xl text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors"
              />
              <span className="ml-4 font-medium text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                {link.name}
              </span>
              <Icon
                icon="tabler:arrow-right"
                className="ml-auto text-zinc-300/50 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 group-hover:translate-x-1 transition-all"
              />
            </motion.a>
          ))}
        </div>
      </motion.section>

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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center text-xs text-zinc-400 space-y-2 pt-12"
      >
        <p>© 2016 - {new Date().getFullYear()}</p>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener"
          className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          京ICP备19050952号-1
        </a>
      </motion.div>
    </div>
  );
}

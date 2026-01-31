'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/coderfee',
    icon: 'tabler:brand-github',
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/coderfee',
    icon: 'tabler:brand-x',
  },
  {
    name: 'RSS',
    url: '/rss.xml',
    icon: 'tabler:rss',
  },
  {
    name: '站点地图',
    url: '/sitemap-0.xml',
    icon: 'tabler:brand-safari',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
};

export default function SocialLinks() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          {socialLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.url}
              title={link.name}
              aria-label={link.name}
              rel="noopener"
              target="_blank"
              variants={itemVariants}
              whileHover={{
                rotate: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.4 },
              }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center p-3 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 transition-colors duration-300"
            >
              <Icon icon={link.icon} className="text-xl" />
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 gap-2"
        >
          <div className="flex items-center gap-3">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-800 dark:hover:text-zinc-200 hover:underline transition-colors"
            >
              京ICP备19050952号-1
            </a>
            <span>·</span>
            <span className="normal-nums">© 2016 - {currentYear}</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

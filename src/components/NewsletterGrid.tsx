'use client';

import dayjs from 'dayjs';
import { motion } from 'framer-motion';

interface NewsletterItem {
  id: string;
  data: {
    title: string;
    description?: string;
    date: Date;
    cover?: any;
    issue: number;
  };
}

interface Props {
  items: NewsletterItem[];
}

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  },
};

export default function NewsletterGrid({ items }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {items.map((item) => (
        <motion.article
          key={item.id}
          variants={itemVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="relative group flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none transition-shadow duration-300"
        >
          <a href={`/newsletter/${item.id}`} className="flex flex-col h-full">
            {item.data.cover && (
              <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={typeof item.data.cover === 'string' ? item.data.cover : item.data.cover.src}
                  alt={item.data.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex-1 p-5 flex flex-col">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                <time dateTime={new Date(item.data.date).toISOString()}>
                  {dayjs(item.data.date).format('YYYY年MM月DD日')}
                </time>
                <span className="font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-[10px] tracking-wide">
                  NO.{item.data.issue}
                </span>
              </div>

              <h2 className="font-noto text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors line-clamp-2 leading-snug">
                {item.data.title}
              </h2>

              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                {item.data.description}
              </p>
            </div>
          </a>
        </motion.article>
      ))}
    </motion.div>
  );
}

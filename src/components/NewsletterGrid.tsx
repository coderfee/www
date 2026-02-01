'use client';

import type { ImageMetadata } from 'astro';
import dayjs from 'dayjs';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { MouseEvent } from 'react';

interface NewsletterItem {
  id: string;
  data: {
    title: string;
    description?: string;
    date: Date;
    cover?: string | ImageMetadata;
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

function NewsletterCard({ item }: { item: NewsletterItem }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const x = useSpring(mouseX, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(mouseY, { stiffness: 150, damping: 15, mass: 0.1 });

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPos = clientX - left - width / 2;
    const yPos = clientY - top - height / 2;

    mouseX.set(xPos / 15);
    mouseY.set(yPos / 15);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.article
      variants={itemVariants}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800"
    >
      <a href={`/newsletter/${item.id}`} className="flex flex-col h-full">
        {item.data.cover && (
          <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative z-0">
            <motion.img
              style={{ x, y, scale: 1.1 }}
              src={typeof item.data.cover === 'string' ? item.data.cover : item.data.cover.src}
              alt={item.data.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 p-5 flex flex-col relative z-10 bg-white dark:bg-zinc-900">
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
  );
}

export default function NewsletterGrid({ items }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {items.map((item) => (
        <NewsletterCard key={item.id} item={item} />
      ))}
    </motion.div>
  );
}

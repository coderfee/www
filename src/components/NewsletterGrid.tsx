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
  title: string;
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
      duration: 0.8,
      ease: [0.21, 0.45, 0.32, 0.9],
    } as const,
  },
};

function FeaturedCard({ item }: { item: NewsletterItem }) {
  return (
    <motion.article variants={itemVariants} className="relative group col-span-12 mb-8">
      <a
        href={`/newsletter/${item.id}`}
        className="flex flex-col lg:grid lg:grid-cols-12 gap-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white dark:border-zinc-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.4)] transition-shadow duration-700"
      >
        <div className="lg:col-span-7 aspect-16/10 lg:aspect-auto overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {item.data.cover && (
            <img
              src={typeof item.data.cover === 'string' ? item.data.cover : item.data.cover.src}
              alt={item.data.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
        </div>

        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center bg-transparent">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[10px] tracking-widest font-bold px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full">
              LATEST ISSUE
            </span>
            <span className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">
              {dayjs(item.data.date).format('YYYY.MM.DD')}
            </span>
          </div>

          <h2 className="font-noto text-3xl lg:text-4xl font-black text-zinc-900 dark:text-zinc-100 mb-6 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors leading-[1.2]">
            {item.data.title}
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed mb-8 line-clamp-4 font-medium">
            {item.data.description}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/50 pt-6">
            <span className="font-noto italic text-4xl text-zinc-100 dark:text-zinc-800 font-black">
              #{item.data.issue.toString().padStart(2, '0')}
            </span>
            <span className="text-zinc-900 dark:text-white font-bold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
              READ MORE <span className="text-xl">→</span>
            </span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}

function NewsletterCard({ item, spanClass }: { item: NewsletterItem; spanClass: string }) {
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
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group flex flex-col h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-4xl overflow-hidden border border-white dark:border-zinc-800/50 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_40px_64px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_64px_-10px_rgba(0,0,0,0.35)] transition-shadow duration-500 ${spanClass}`}
    >
      <a href={`/newsletter/${item.id}`} className="flex flex-col h-full">
        {item.data.cover && (
          <div className="aspect-16/10 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative z-0">
            <motion.img
              style={{ x, y, scale: 1.1 }}
              src={typeof item.data.cover === 'string' ? item.data.cover : item.data.cover.src}
              alt={item.data.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-tight shadow-sm border border-white/50 dark:border-zinc-800/50">
                ISSUE {item.data.issue}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 flex flex-col relative z-10 bg-transparent">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4 font-bold">
            {dayjs(item.data.date).format('MMMM DD, YYYY')}
          </div>

          <h2 className="font-noto text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors line-clamp-2 leading-snug">
            {item.data.title}
          </h2>

          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3 font-medium">
            {item.data.description}
          </p>
        </div>
      </a>
    </motion.article>
  );
}

export default function NewsletterGrid({ items, title }: Props) {
  const [featured, ...others] = items;

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">
      <aside className="hidden lg:flex lg:w-20 lg:sticky lg:top-28 lg:flex-col items-center py-2 lg:border-r border-zinc-100 dark:border-zinc-800/50 transform-gpu backface-hidden">
        <div className="lg:[writing-mode:vertical-rl] flex items-center gap-8">
          <h1 className="font-noto text-2xl lg:text-5xl font-black tracking-[0.05em] text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
            {title}
          </h1>
          <div className="h-px w-8 lg:h-16 lg:w-px bg-zinc-200 dark:bg-zinc-800/80"></div>
          <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-400 dark:text-zinc-500 uppercase whitespace-nowrap">
            coderfee.com
          </p>
        </div>
      </aside>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 grid grid-cols-12 gap-6 lg:gap-10"
      >
        {featured && <FeaturedCard item={featured} />}

        {others.map((item, index) => {
          let spanClass = 'col-span-12 md:col-span-6';
          if (index % 5 >= 2) {
            spanClass = 'col-span-12 md:col-span-4';
          }

          return <NewsletterCard key={item.id} item={item} spanClass={spanClass} />;
        })}
      </motion.div>
    </div>
  );
}

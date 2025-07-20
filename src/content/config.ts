import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tldr: z.string(),
      // Transform string to Date object
      date: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      heroImage: z.string().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
      cover: image().optional().or(z.string().optional()),
      keywords: z.array(z.string()).optional(),
    }),
});

const newsletter = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      date: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      issue: z.number(),
      draft: z.boolean().optional(),
      cover: image().optional().or(z.string().optional()),
    }),
});

const photos = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().or(image()),
    thumbnail: z.string().optional().or(image().optional()),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    alt: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    // 新增优化相关字段
    formats: z.object({
      webp: z.string().optional(),
      avif: z.string().optional(),
      jpeg: z.string().optional(),
    }).optional(),
    sizes: z.object({
      thumbnail: z.object({ width: z.number(), height: z.number() }).optional(),
      medium: z.object({ width: z.number(), height: z.number() }).optional(),
      large: z.object({ width: z.number(), height: z.number() }).optional(),
    }).optional(),
    quality: z.number().min(1).max(100).default(85),
    priority: z.boolean().default(false), // 是否优先加载
  }),
});

export const collections = { blog, newsletter, photos };

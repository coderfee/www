import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tldr: z.string(),
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
  loader: glob({ base: './src/content/newsletter', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      issue: z.number(),
      draft: z.boolean().optional(),
      cover: image().optional().or(z.string().optional()),
    }),
});

export const collections = { blog, newsletter };

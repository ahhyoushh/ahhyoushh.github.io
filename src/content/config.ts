import { defineCollection, z } from 'astro:content';

const blogs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    link: z.string(),
    date: z.string().optional(),
  }),
});

export const collections = { blogs };

const { z } = require('zod');

const createAdviceSchema = z.object({
  targetDisease: z.string().min(1, 'targetDisease is required'),
  dos: z.array(z.string()).default([]),
  donts: z.array(z.string()).default([])
});

const createBlogSchema = z.object({
  targetDisease: z.string().min(1, 'targetDisease is required'),
  title: z.string().min(1, 'title is required'),
  coverImageURL: z.string().url().optional().nullable(),
  content: z.string().min(1, 'content is required')
});

module.exports = {
  createAdviceSchema,
  createBlogSchema
};

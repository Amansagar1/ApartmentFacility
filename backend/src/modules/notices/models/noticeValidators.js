const { z } = require('zod');

const createNoticeSchema = z.object({
  body: z.object({
    associationId: z.string().min(1, 'Association ID required'),
    title: z.string().min(3, 'Title is too short'),
    content: z.string().min(10, 'Content is too short'),
    isImportant: z.boolean().optional(),
  }),
});

module.exports = { createNoticeSchema };

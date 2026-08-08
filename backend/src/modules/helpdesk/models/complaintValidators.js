const { z } = require('zod');

const raiseComplaintSchema = z.object({
  body: z.object({
    associationId: z.string().min(1, 'Association ID required'),
    title: z.string().min(3, 'Title is too short'),
    description: z.string().min(10, 'Description is too short'),
    category: z.enum(['Plumbing', 'Electrical', 'Cleanliness', 'Security', 'Other']).optional(),
  }),
});

const updateComplaintStatusSchema = z.object({
  body: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  }),
});

module.exports = { raiseComplaintSchema, updateComplaintStatusSchema };

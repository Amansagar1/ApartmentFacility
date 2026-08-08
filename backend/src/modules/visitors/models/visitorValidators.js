const { z } = require('zod');

const addVisitorSchema = z.object({
  body: z.object({
    associationId: z.string().min(1, 'Association ID required'),
    flatId: z.string().min(1, 'Flat ID required'),
    visitorName: z.string().min(1, 'Visitor name required'),
    visitorPhone: z.string().min(10, 'Valid phone number required'),
    purpose: z.enum(['Delivery', 'Guest', 'Service', 'Other']).optional(),
  }),
});

const updateVisitorStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'DENIED', 'ENTERED', 'EXITED']),
  }),
});

module.exports = { addVisitorSchema, updateVisitorStatusSchema };

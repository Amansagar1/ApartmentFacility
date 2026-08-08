const { z } = require('zod');

const addFlatSchema = z.object({
  body: z.object({
    associationId: z.string().min(1, 'Association ID is required'),
    blockName: z.string().min(1, 'Block name is required'),
    flatNumber: z.string().min(1, 'Flat number is required'),
    ownerEmail: z.string().email('Valid owner email is required').optional().or(z.literal('')),
    tenantEmail: z.string().email('Valid tenant email is required').optional().or(z.literal('')),
  }),
});

module.exports = { addFlatSchema };

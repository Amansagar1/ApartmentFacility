const { z } = require('zod');

// ----------------Association Request Validation Schemas------------
const createAssociationSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Association name must be at least 3 characters'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().min(6, 'Pincode must be valid'),
    totalUnits: z.number().int().positive('Total units must be a positive number'),
  }),
});

module.exports = { createAssociationSchema };

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

try {
  addVisitorSchema.parse({
    body: {
      associationId: "609c2a6f2b5a1c001f3e7a3a",
      flatId: "609c2a6f2b5a1c001f3e7a3a",
      visitorName: "Amazon",
      visitorPhone: "123", // invalid length
      purpose: "Delivery"
    }
  });
} catch (error) {
  console.log("Error Name:", error.name);
  console.log("Error Message:", error.message);
}

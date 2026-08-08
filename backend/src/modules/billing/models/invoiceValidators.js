const { z } = require('zod');

const generateInvoicesSchema = z.object({
  body: z.object({
    associationId: z.string().min(1, 'Association ID required'),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    billingMonth: z.string().min(1, 'Billing month required'),
    dueDate: z.string().min(1, 'Due date required'),
  }),
});

module.exports = { generateInvoicesSchema };

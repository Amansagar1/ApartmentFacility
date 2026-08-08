const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  associationId: { type: mongoose.Schema.ObjectId, ref: 'Association', required: true },
  flatId: { type: mongoose.Schema.ObjectId, ref: 'Flat', required: true },
  amount: { type: Number, required: true },
  billingMonth: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);

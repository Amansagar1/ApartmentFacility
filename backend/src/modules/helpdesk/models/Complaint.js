const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  associationId: { type: mongoose.Schema.ObjectId, ref: 'Association', required: true },
  residentId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Plumbing', 'Electrical', 'Cleanliness', 'Security', 'Other'], 
    default: 'Other' 
  },
  status: { 
    type: String, 
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], 
    default: 'OPEN' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);

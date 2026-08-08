const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  associationId: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Association', 
    required: true 
  },
  flatId: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Flat', 
    required: true 
  },
  visitorName: { 
    type: String, 
    required: true 
  },
  visitorPhone: { 
    type: String, 
    required: true 
  },
  purpose: { 
    type: String, 
    enum: ['Delivery', 'Guest', 'Service', 'Other'], 
    default: 'Guest' 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'DENIED', 'ENTERED', 'EXITED'], 
    default: 'PENDING' 
  },
  entryTime: { type: Date },
  exitTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);

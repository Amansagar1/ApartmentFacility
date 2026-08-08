const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema({
  associationId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Association',
    required: true,
  },
  blockName: {
    type: String,
    required: [true, 'Please provide block name (e.g. A, B, Tower 1)'],
    trim: true,
  },
  flatNumber: {
    type: String,
    required: [true, 'Please provide flat number (e.g. 101, 402)'],
    trim: true,
  },
  ownerEmail: {
    type: String, // Store email to invite them later
    lowercase: true,
  },
  tenantEmail: {
    type: String, // Store tenant email if rented
    lowercase: true,
  }
}, {
  timestamps: true,
});

// Ensure a flat number is unique within a block within a specific association
flatSchema.index({ associationId: 1, blockName: 1, flatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Flat', flatSchema);

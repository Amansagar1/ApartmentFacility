const mongoose = require('mongoose');

// ----------------Association Schema------------
const associationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide association name'],
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  settings: {
    maintenanceFeePerSqFt: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    allowTenantVisitorApproval: {
      type: Boolean,
      default: true,
    }
  },
}, { timestamps: true });

module.exports = mongoose.model('Association', associationSchema);

const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  associationId: { type: mongoose.Schema.ObjectId, ref: 'Association', required: true },
  authorId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isImportant: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);

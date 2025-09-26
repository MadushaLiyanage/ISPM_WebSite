const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Security', 'Privacy', 'Ethics', 'HR', 'Compliance', 'Other']
  },
  content: {
    type: String,
    required: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requiresAcknowledgment: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
policySchema.index({ title: 'text', category: 'text', content: 'text' });

module.exports = mongoose.model('Policy', policySchema);
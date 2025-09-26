const mongoose = require('mongoose');

const policyAcknowledgmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  },
  acknowledgedAt: {
    type: Date,
    default: Date.now
  },
  version: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Ensure one acknowledgment per user per policy version
policyAcknowledgmentSchema.index({ userId: 1, policyId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('PolicyAcknowledgment', policyAcknowledgmentSchema);
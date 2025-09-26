const mongoose = require('mongoose');

const TrainingEnrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  training: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Training',
    required: true
  },
  status: {
    type: String,
    enum: ['enrolled', 'in-progress', 'completed', 'failed', 'expired'],
    default: 'enrolled'
  },
  enrolledDate: {
    type: Date,
    default: Date.now
  },
  startedDate: Date,
  completedDate: Date,
  dueDate: Date,
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  attempts: [{
    attemptNumber: Number,
    startedAt: Date,
    completedAt: Date,
    score: Number,
    passed: Boolean
  }],
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String,
  notes: String
}, {
  timestamps: true
});

// Compound index to ensure unique enrollment per user per training
TrainingEnrollmentSchema.index({ user: 1, training: 1 }, { unique: true });
TrainingEnrollmentSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('TrainingEnrollment', TrainingEnrollmentSchema);
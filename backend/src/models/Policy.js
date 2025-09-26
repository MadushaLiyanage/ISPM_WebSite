const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a policy title'],
    trim: true,
    maxlength: [200, 'Policy title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add policy content']
  },
  version: {
    type: String,
    required: [true, 'Please add a version number'],
    default: '1.0.0'
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'published', 'archived', 'under-review'],
    default: 'draft'
  },
  category: {
    type: String,
    required: [true, 'Please add a policy category'],
    enum: ['security', 'privacy', 'hr', 'it', 'compliance', 'safety', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign an author']
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedDate: {
    type: Date
  },
  effectiveDate: {
    type: Date,
    required: [true, 'Please add an effective date']
  },
  expiryDate: {
    type: Date
  },
  lastReviewDate: {
    type: Date
  },
  nextReviewDate: {
    type: Date
  },
  file: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  acknowledgments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  revisionHistory: [{
    version: String,
    changes: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  metadata: {
    downloadCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    },
    acknowledgmentRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for acknowledgment percentage
PolicySchema.virtual('acknowledgmentPercentage').get(function() {
  const User = mongoose.model('User');
  // This would need to be calculated with aggregation in practice
  return this.metadata.acknowledgmentRate;
});

// Virtual for current version status
PolicySchema.virtual('isCurrentVersion').get(function() {
  return this.status === 'published' && !this.isArchived;
});

// Middleware to set published date when status changes to published
PolicySchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }
  next();
});

// Index for better performance
PolicySchema.index({ status: 1, category: 1 });
PolicySchema.index({ author: 1 });
PolicySchema.index({ effectiveDate: 1, expiryDate: 1 });
PolicySchema.index({ 'acknowledgments.user': 1 });

module.exports = mongoose.model('Policy', PolicySchema);
const mongoose = require('mongoose');

const PhishingCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a campaign name'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  template: {
    type: String,
    required: [true, 'Please specify a template'],
    enum: ['email', 'sms', 'social-media', 'website'],
    default: 'email'
  },
  content: {
    subject: String,
    body: String,
    senderName: String,
    senderEmail: String,
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      path: String
    }]
  },
  targetUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date,
    clickedAt: Date,
    reportedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'clicked', 'reported', 'failed'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  scheduledAt: Date,
  startedAt: Date,
  completedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    trackClicks: {
      type: Boolean,
      default: true
    },
    trackReports: {
      type: Boolean,
      default: true
    },
    sendReminder: {
      type: Boolean,
      default: false
    },
    reminderDelay: {
      type: Number, // in hours
      default: 24
    }
  },
  metrics: {
    totalSent: {
      type: Number,
      default: 0
    },
    totalClicked: {
      type: Number,
      default: 0
    },
    totalReported: {
      type: Number,
      default: 0
    },
    clickRate: {
      type: Number,
      default: 0
    },
    reportRate: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add text index for search functionality
PhishingCampaignSchema.index({
  name: 'text',
  description: 'text',
  'content.subject': 'text',
  tags: 'text'
});

module.exports = mongoose.model('PhishingCampaign', PhishingCampaignSchema);
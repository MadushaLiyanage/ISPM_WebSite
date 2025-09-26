const mongoose = require('mongoose');

const EducationContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  contentType: {
    type: String,
    enum: ['article', 'video', 'presentation', 'document', 'interactive'],
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['cybersecurity', 'compliance', 'best-practices', 'policies', 'general']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    avgRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  publishedAt: Date,
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add text index for search functionality
EducationContentSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text'
});

module.exports = mongoose.model('EducationContent', EducationContentSchema);
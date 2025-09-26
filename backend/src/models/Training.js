const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a training title'],
    trim: true,
    maxlength: [200, 'Training title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a training category'],
    enum: ['security', 'compliance', 'technical', 'safety', 'hr', 'other']
  },
  type: {
    type: String,
    enum: ['online', 'classroom', 'workshop', 'certification'],
    default: 'online'
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please add training duration']
  },
  content: {
    type: String
  },
  materials: [{
    title: String,
    type: {
      type: String,
      enum: ['document', 'video', 'presentation', 'link']
    },
    url: String,
    file: {
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number
    }
  }],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  targetRoles: [{
    type: String,
    enum: ['user', 'admin', 'manager']
  }],
  targetDepartments: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedDate: Date,
  dueDate: Date,
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for enrollment count
TrainingSchema.virtual('enrollmentCount', {
  ref: 'TrainingEnrollment',
  localField: '_id',
  foreignField: 'training',
  count: true
});

// Virtual for completion count
TrainingSchema.virtual('completionCount', {
  ref: 'TrainingEnrollment',
  localField: '_id',
  foreignField: 'training',
  match: { status: 'completed' },
  count: true
});

TrainingSchema.index({ status: 1, category: 1 });
TrainingSchema.index({ targetRoles: 1 });
TrainingSchema.index({ publishedDate: -1 });

module.exports = mongoose.model('Training', TrainingSchema);
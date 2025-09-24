const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [200, 'Task title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'review', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Task must belong to a project']
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish'],
      default: 'finish-to-start'
    }
  }],
  subtasks: [{
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subtask completion percentage
TaskSchema.virtual('subtaskProgress').get(function() {
  if (this.subtasks.length === 0) return 100;
  
  const completed = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Middleware to set completedAt when status changes to completed
TaskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = undefined;
    }
  }
  next();
});

// Index for better performance
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignee: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model('Task', TaskSchema);
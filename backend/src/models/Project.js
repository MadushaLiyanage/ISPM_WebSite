const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a project description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    required: true,
    enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  },
  budget: {
    allocated: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    }
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a project manager']
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
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
  client: {
    name: String,
    email: String,
    company: String
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

// Virtual for task count
ProjectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Calculate project progress based on completed tasks
ProjectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  const totalTasks = await Task.countDocuments({ project: this._id });
  
  if (totalTasks === 0) return 0;
  
  const completedTasks = await Task.countDocuments({ 
    project: this._id, 
    status: 'completed' 
  });
  
  return Math.round((completedTasks / totalTasks) * 100);
};

// Index for better performance
ProjectSchema.index({ manager: 1, status: 1 });
ProjectSchema.index({ 'team.user': 1 });
ProjectSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
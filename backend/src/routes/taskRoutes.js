const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, project, assignee, page = 1, limit = 10, search } = req.query;
    
    let query = {};
    
    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;
    if (assignee) query.assignee = assignee;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based filtering
    if (req.user.role !== 'admin') {
      query.$or = [
        { assignee: req.user.id },
        { assignedBy: req.user.id }
      ];
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name description')
      .populate('assignee', 'name email department')
      .populate('assignedBy', 'name email')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    req.body.assignedBy = req.user.id;

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user can update this task
    if (task.assignee?.toString() !== req.user.id && 
        task.assignedBy.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user can delete this task
    if (task.assignedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
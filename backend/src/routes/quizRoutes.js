const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLogger');
const Quiz = require('../models/Quiz');

const router = express.Router();

// Apply authentication and admin authorization
router.use(protect);
router.use(adminOnly);
router.use(auditLogger({ logLevel: 'all' }));

// @desc    Get all quizzes
// @route   GET /api/admin/quizzes
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    
    let query = { isArchived: false };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const quizzes = await Quiz.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Quiz.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        quizzes,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quizzes',
      error: error.message
    });
  }
});

// @desc    Get single quiz
// @route   GET /api/admin/quizzes/:id
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('author', 'name email');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz',
      error: error.message
    });
  }
});

// @desc    Create new quiz
// @route   POST /api/admin/quizzes
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      author: req.user._id
    };
    
    const quiz = await Quiz.create(quizData);
    
    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
});

// @desc    Update quiz
// @route   PUT /api/admin/quizzes/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: quiz,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
});

// @desc    Delete quiz
// @route   DELETE /api/admin/quizzes/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Quiz archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to archive quiz',
      error: error.message
    });
  }
});

module.exports = router;
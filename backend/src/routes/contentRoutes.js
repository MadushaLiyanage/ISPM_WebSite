const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLogger');
const EducationContent = require('../models/EducationContent');
const { validationResult } = require('express-validator');

const router = express.Router();

// Apply authentication and admin authorization
router.use(protect);
router.use(adminOnly);
router.use(auditLogger({ logLevel: 'all' }));

// @desc    Get all education content
// @route   GET /api/admin/content
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
    
    const content = await EducationContent.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await EducationContent.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        content,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve content',
      error: error.message
    });
  }
});

// @desc    Get single education content
// @route   GET /api/admin/content/:id
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const content = await EducationContent.findById(req.params.id)
      .populate('author', 'name email');
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve content',
      error: error.message
    });
  }
});

// @desc    Create new education content
// @route   POST /api/admin/content
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const contentData = {
      ...req.body,
      author: req.user._id
    };
    
    const content = await EducationContent.create(contentData);
    
    res.status(201).json({
      success: true,
      data: content,
      message: 'Content created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message
    });
  }
});

// @desc    Update education content
// @route   PUT /api/admin/content/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const content = await EducationContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email');
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: content,
      message: 'Content updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message
    });
  }
});

// @desc    Delete education content
// @route   DELETE /api/admin/content/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const content = await EducationContent.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Content archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to archive content',
      error: error.message
    });
  }
});

module.exports = router;
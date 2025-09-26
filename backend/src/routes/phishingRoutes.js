const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLogger');
const PhishingCampaign = require('../models/PhishingCampaign');

const router = express.Router();

// Apply authentication and admin authorization
router.use(protect);
router.use(adminOnly);
router.use(auditLogger({ logLevel: 'all' }));

// @desc    Get all phishing campaigns
// @route   GET /api/admin/phishing
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = { isArchived: false };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const campaigns = await PhishingCampaign.find(query)
      .populate('createdBy', 'name email')
      .populate('targetUsers.user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await PhishingCampaign.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        campaigns,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaigns',
      error: error.message
    });
  }
});

// @desc    Get single phishing campaign
// @route   GET /api/admin/phishing/:id
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const campaign = await PhishingCampaign.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('targetUsers.user', 'name email');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaign',
      error: error.message
    });
  }
});

// @desc    Create new phishing campaign
// @route   POST /api/admin/phishing
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const campaign = await PhishingCampaign.create(campaignData);
    
    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
});

// @desc    Update phishing campaign
// @route   PUT /api/admin/phishing/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const campaign = await PhishingCampaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  }
});

// @desc    Delete phishing campaign
// @route   DELETE /api/admin/phishing/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await PhishingCampaign.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Campaign archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to archive campaign',
      error: error.message
    });
  }
});

// @desc    Launch phishing simulation
// @route   POST /api/admin/phishing/:id/launch
// @access  Private/Admin
router.post('/:id/launch', async (req, res) => {
  try {
    const campaign = await PhishingCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    if (campaign.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is already active'
      });
    }
    
    // Update campaign status to active and set start time
    campaign.status = 'active';
    campaign.startedAt = new Date();
    
    // In a real implementation, this would trigger the actual phishing emails
    // For now, we'll just simulate the launch
    
    await campaign.save();
    
    res.status(200).json({
      success: true,
      data: campaign,
      message: 'Phishing simulation launched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to launch simulation',
      error: error.message
    });
  }
});

// @desc    Stop phishing simulation
// @route   POST /api/admin/phishing/:id/stop
// @access  Private/Admin
router.post('/:id/stop', async (req, res) => {
  try {
    const campaign = await PhishingCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not currently active'
      });
    }
    
    // Update campaign status to completed
    campaign.status = 'completed';
    campaign.completedAt = new Date();
    
    await campaign.save();
    
    res.status(200).json({
      success: true,
      data: campaign,
      message: 'Phishing simulation stopped successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop simulation',
      error: error.message
    });
  }
});

module.exports = router;
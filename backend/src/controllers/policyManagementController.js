const Policy = require('../models/Policy');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const path = require('path');
const fs = require('fs').promises;

// @desc    Get all policies with pagination and search
// @route   GET /api/admin/policies
// @access  Private/Admin
const getPolicies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }

    // Don't show archived by default
    query.isArchived = false;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const policies = await Policy.find(query)
      .populate('author', 'name email')
      .populate('approver', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Policy.countDocuments(query);

    // Log the access
    await AuditLog.createLog({
      user: req.user.id,
      action: 'List policies',
      actionType: 'READ',
      resource: 'POLICY',
      details: `Retrieved ${policies.length} policies with filters: ${JSON.stringify({ search, category, status })}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    res.status(200).json({
      success: true,
      data: {
        policies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve policies',
      error: error.message
    });
  }
};

// @desc    Get single policy
// @route   GET /api/admin/policies/:id
// @access  Private/Admin
const getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('author', 'name email')
      .populate('approver', 'name email')
      .populate('acknowledgments.user', 'name email')
      .populate('revisionHistory.changedBy', 'name email');
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Increment view count
    policy.metadata.viewCount += 1;
    await policy.save();

    // Log the access
    await AuditLog.createLog({
      user: req.user.id,
      action: 'View policy details',
      actionType: 'READ',
      resource: 'POLICY',
      resourceId: policy._id,
      details: `Viewed policy: ${policy.title}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    res.status(200).json({
      success: true,
      data: policy
    });

  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve policy',
      error: error.message
    });
  }
};

// @desc    Create policy
// @route   POST /api/admin/policies
// @access  Private/Admin
const createPolicy = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      tags,
      effectiveDate,
      expiryDate,
      nextReviewDate
    } = req.body;

    // Create policy
    const policy = await Policy.create({
      title,
      description,
      content,
      category,
      tags: tags || [],
      author: req.user.id,
      effectiveDate,
      expiryDate,
      nextReviewDate,
      version: '1.0.0'
    });

    const populatedPolicy = await Policy.findById(policy._id)
      .populate('author', 'name email');

    // Log the creation
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Create policy',
      actionType: 'CREATE',
      resource: 'POLICY',
      resourceId: policy._id,
      details: `Created new policy: ${policy.title}`,
      changes: {
        before: null,
        after: {
          title: policy.title,
          category: policy.category,
          status: policy.status,
          version: policy.version
        }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    res.status(201).json({
      success: true,
      data: populatedPolicy,
      message: 'Policy created successfully'
    });

  } catch (error) {
    console.error('Create policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create policy',
      error: error.message
    });
  }
};

// @desc    Update policy
// @route   PUT /api/admin/policies/:id
// @access  Private/Admin
const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Store original values for audit and revision history
    const originalPolicy = {
      title: policy.title,
      description: policy.description,
      content: policy.content,
      category: policy.category,
      tags: policy.tags,
      status: policy.status,
      version: policy.version,
      effectiveDate: policy.effectiveDate,
      expiryDate: policy.expiryDate,
      nextReviewDate: policy.nextReviewDate
    };

    const {
      title,
      description,
      content,
      category,
      tags,
      status,
      effectiveDate,
      expiryDate,
      nextReviewDate,
      versionNotes
    } = req.body;

    // Check if this is a major update that requires versioning
    const isMajorUpdate = content !== policy.content || title !== policy.title;
    
    if (isMajorUpdate && policy.status === 'published') {
      // Create new version
      const versionParts = policy.version.split('.');
      const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}.0`;
      policy.version = newVersion;
    }

    // Update policy fields
    if (title) policy.title = title;
    if (description !== undefined) policy.description = description;
    if (content) policy.content = content;
    if (category) policy.category = category;
    if (tags) policy.tags = tags;
    if (status) policy.status = status;
    if (effectiveDate) policy.effectiveDate = effectiveDate;
    if (expiryDate) policy.expiryDate = expiryDate;
    if (nextReviewDate) policy.nextReviewDate = nextReviewDate;

    // Add to revision history
    policy.revisionHistory.push({
      version: policy.version,
      changes: versionNotes || 'Policy updated',
      changedBy: req.user.id,
      changedAt: new Date()
    });

    await policy.save();

    const updatedPolicy = await Policy.findById(policy._id)
      .populate('author', 'name email')
      .populate('approver', 'name email');

    // Log the update
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Update policy',
      actionType: 'UPDATE',
      resource: 'POLICY',
      resourceId: policy._id,
      details: `Updated policy: ${policy.title} ${isMajorUpdate ? `(new version: ${policy.version})` : ''}`,
      changes: {
        before: originalPolicy,
        after: {
          title: policy.title,
          description: policy.description,
          category: policy.category,
          status: policy.status,
          version: policy.version,
          effectiveDate: policy.effectiveDate,
          expiryDate: policy.expiryDate
        }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      },
      severity: isMajorUpdate ? 'MEDIUM' : 'LOW'
    });

    res.status(200).json({
      success: true,
      data: updatedPolicy,
      message: 'Policy updated successfully'
    });

  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update policy',
      error: error.message
    });
  }
};

// @desc    Delete policy
// @route   DELETE /api/admin/policies/:id
// @access  Private/Admin
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Store policy data for audit log
    const deletedPolicyData = {
      title: policy.title,
      category: policy.category,
      status: policy.status,
      version: policy.version
    };

    // Delete associated file if exists
    if (policy.file && policy.file.path) {
      try {
        await fs.unlink(policy.file.path);
      } catch (fileError) {
        console.error('Error deleting policy file:', fileError);
      }
    }

    await Policy.findByIdAndDelete(req.params.id);

    // Log the deletion
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Delete policy',
      actionType: 'DELETE',
      resource: 'POLICY',
      resourceId: policy._id,
      details: `Deleted policy: ${policy.title}`,
      changes: {
        before: deletedPolicyData,
        after: null
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      },
      severity: 'HIGH'
    });

    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully'
    });

  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete policy',
      error: error.message
    });
  }
};

// @desc    Publish policy
// @route   PUT /api/admin/policies/:id/publish
// @access  Private/Admin
const publishPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    if (policy.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Policy is already published'
      });
    }

    const previousStatus = policy.status;
    policy.status = 'published';
    policy.publishedDate = new Date();
    policy.approver = req.user.id;

    await policy.save();

    // Log the publication
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Publish policy',
      actionType: 'POLICY_PUBLISH',
      resource: 'POLICY',
      resourceId: policy._id,
      details: `Published policy: ${policy.title}`,
      changes: {
        before: { status: previousStatus },
        after: { status: 'published', publishedDate: policy.publishedDate }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      },
      severity: 'MEDIUM'
    });

    res.status(200).json({
      success: true,
      message: 'Policy published successfully'
    });

  } catch (error) {
    console.error('Publish policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish policy',
      error: error.message
    });
  }
};

// @desc    Archive policy
// @route   PUT /api/admin/policies/:id/archive
// @access  Private/Admin
const archivePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    if (policy.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Policy is already archived'
      });
    }

    const previousStatus = policy.status;
    policy.status = 'archived';
    policy.isArchived = true;

    await policy.save();

    // Log the archiving
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Archive policy',
      actionType: 'POLICY_ARCHIVE',
      resource: 'POLICY',
      resourceId: policy._id,
      details: `Archived policy: ${policy.title}`,
      changes: {
        before: { status: previousStatus, isArchived: false },
        after: { status: 'archived', isArchived: true }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      },
      severity: 'MEDIUM'
    });

    res.status(200).json({
      success: true,
      message: 'Policy archived successfully'
    });

  } catch (error) {
    console.error('Archive policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive policy',
      error: error.message
    });
  }
};

// @desc    Upload policy file
// @route   POST /api/admin/policies/:id/upload
// @access  Private/Admin
const uploadPolicyFile = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Delete old file if exists
    if (policy.file && policy.file.path) {
      try {
        await fs.unlink(policy.file.path);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }
    }

    // Update policy with new file info
    policy.file = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    };

    await policy.save();

    // Log the file upload
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Upload policy file',
      actionType: 'FILE_UPLOAD',
      resource: 'POLICY',
      resourceId: policy._id,
      details: `Uploaded file for policy: ${policy.title} (${req.file.originalname})`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        fileInfo: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        file: policy.file
      }
    });

  } catch (error) {
    console.error('Upload policy file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

// @desc    Get policy acknowledgments
// @route   GET /api/admin/policies/:id/acknowledgments
// @access  Private/Admin
const getPolicyAcknowledgments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20
    } = req.query;

    const policy = await Policy.findById(req.params.id)
      .populate({
        path: 'acknowledgments.user',
        select: 'name email department position'
      })
      .select('acknowledgments title');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Paginate acknowledgments
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    
    const acknowledgments = policy.acknowledgments
      .slice(startIndex, endIndex);

    const total = policy.acknowledgments.length;

    res.status(200).json({
      success: true,
      data: {
        acknowledgments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get policy acknowledgments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve policy acknowledgments',
      error: error.message
    });
  }
};

module.exports = {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  publishPolicy,
  archivePolicy,
  uploadPolicyFile,
  getPolicyAcknowledgments
};
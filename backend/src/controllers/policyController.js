const Policy = require('../models/Policy');
const PolicyAcknowledgment = require('../models/PolicyAcknowledgment');
const Notification = require('../models/Notification');

// Get all policies with optional search
exports.getPolicies = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    let query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const policies = await Policy.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ lastUpdated: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Policy.countDocuments(query);

    // Get user's acknowledgments
    const userId = req.user?.id;
    let acknowledgments = [];
    if (userId) {
      acknowledgments = await PolicyAcknowledgment.find({ userId })
        .populate('policyId', 'version');
    }

    // Add acknowledgment status to policies
    const policiesWithStatus = policies.map(policy => {
      const acknowledgment = acknowledgments.find(ack =>
        ack.policyId._id.toString() === policy._id.toString() &&
        ack.version === policy.version
      );

      return {
        ...policy.toObject(),
        acknowledged: !!acknowledgment,
        acknowledgedAt: acknowledgment?.acknowledgedAt
      };
    });

    res.json({
      policies: policiesWithStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single policy by ID
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Check if user has acknowledged this policy
    const userId = req.user?.id;
    let acknowledgment = null;
    if (userId) {
      acknowledgment = await PolicyAcknowledgment.findOne({
        userId,
        policyId: policy._id,
        version: policy.version
      });
    }

    res.json({
      ...policy.toObject(),
      acknowledged: !!acknowledgment,
      acknowledgedAt: acknowledgment?.acknowledgedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Acknowledge a policy
exports.acknowledgePolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    const userId = req.user.id;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Check if already acknowledged
    const existingAcknowledgment = await PolicyAcknowledgment.findOne({
      userId,
      policyId,
      version: policy.version
    });

    if (existingAcknowledgment) {
      return res.status(400).json({ message: 'Policy already acknowledged' });
    }

    // Create acknowledgment
    const acknowledgment = new PolicyAcknowledgment({
      userId,
      policyId,
      version: policy.version,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await acknowledgment.save();

    // Create notification for acknowledgment
    const notification = new Notification({
      userId,
      type: 'policy',
      title: 'Policy Acknowledged',
      message: `You have successfully acknowledged "${policy.title}"`,
      priority: 'low',
      relatedId: policyId,
      relatedModel: 'Policy'
    });

    await notification.save();

    res.json({
      message: 'Policy acknowledged successfully',
      acknowledgedAt: acknowledgment.acknowledgedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's policy acknowledgments
exports.getUserAcknowledgments = async (req, res) => {
  try {
    const userId = req.user.id;

    const acknowledgments = await PolicyAcknowledgment.find({ userId })
      .populate('policyId', 'title category version lastUpdated')
      .sort({ acknowledgedAt: -1 });

    res.json(acknowledgments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Create new policy
exports.createPolicy = async (req, res) => {
  try {
    const { title, category, content, version, effectiveDate, requiresAcknowledgment } = req.body;

    const policy = new Policy({
      title,
      category,
      content,
      version: version || '1.0',
      effectiveDate,
      requiresAcknowledgment: requiresAcknowledgment !== false,
      createdBy: req.user.id
    });

    await policy.save();

    // Notify all users about new policy
    const users = await require('../models/User').find({ isActive: true });
    const notifications = users.map(user => ({
      userId: user._id,
      type: 'policy',
      title: 'New Policy Available',
      message: `A new policy "${title}" has been published. Please review and acknowledge.`,
      priority: 'medium',
      relatedId: policy._id,
      relatedModel: 'Policy'
    }));

    await Notification.insertMany(notifications);

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update policy
exports.updatePolicy = async (req, res) => {
  try {
    const { title, category, content, version, effectiveDate, isActive } = req.body;

    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        content,
        version,
        effectiveDate,
        isActive,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // If policy was updated, notify users who haven't acknowledged the new version
    if (version && version !== policy.version) {
      // This would require additional logic to notify users
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
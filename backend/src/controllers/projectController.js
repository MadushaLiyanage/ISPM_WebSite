const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10, search } = req.query;
    
    let query = {};
    
    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based filtering
    if (req.user.role !== 'admin') {
      query.$or = [
        { manager: req.user.id },
        { 'team.user': req.user.id }
      ];
    }

    const projects = await Project.find(query)
      .populate('manager', 'name email')
      .populate('team.user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email department')
      .populate('team.user', 'name email department')
      .populate('taskCount');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user has access to this project
    if (req.user.role !== 'admin' && 
        project.manager.toString() !== req.user.id && 
        !project.team.some(member => member.user._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this project'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin/Manager)
const createProject = async (req, res, next) => {
  try {
    // Add manager to req.body
    req.body.manager = req.user.id;

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project manager or admin
    if (project.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this project'
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin/Manager)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project manager or admin
    if (project.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this project'
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add team member to project
// @route   POST /api/projects/:id/team
// @access  Private (Admin/Manager)
const addTeamMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user is already in team
    const existingMember = project.team.find(
      member => member.user.toString() === req.body.userId
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: 'User is already a team member'
      });
    }

    project.team.push({
      user: req.body.userId,
      role: req.body.role || 'member'
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember
};
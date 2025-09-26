const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let projectQuery = {};
    let taskQuery = {};

    // Filter data based on user role
    if (userRole !== 'admin') {
      projectQuery = {
        $or: [
          { manager: userId },
          { 'team.user': userId }
        ]
      };
      taskQuery = {
        $or: [
          { assignee: userId },
          { assignedBy: userId }
        ]
      };
    }

    // Get project statistics
    const totalProjects = await Project.countDocuments(projectQuery);
    const activeProjects = await Project.countDocuments({
      ...projectQuery,
      status: { $in: ['planning', 'in-progress'] }
    });
    const completedProjects = await Project.countDocuments({
      ...projectQuery,
      status: 'completed'
    });

    // Get task statistics
    const totalTasks = await Task.countDocuments(taskQuery);
    const pendingTasks = await Task.countDocuments({
      ...taskQuery,
      status: 'pending'
    });
    const inProgressTasks = await Task.countDocuments({
      ...taskQuery,
      status: 'in-progress'
    });
    const completedTasks = await Task.countDocuments({
      ...taskQuery,
      status: 'completed'
    });

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    // Get team size (only for admins and managers)
    let teamSize = 0;
    if (userRole === 'admin') {
      teamSize = await User.countDocuments({ isActive: true });
    } else if (userRole === 'manager') {
      const managedProjects = await Project.find({ manager: userId });
      const teamMembers = new Set();
      managedProjects.forEach(project => {
        project.team.forEach(member => {
          teamMembers.add(member.user.toString());
        });
      });
      teamSize = teamMembers.size;
    }

    res.status(200).json({
      success: true,
      data: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects
        },
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
          overdue: overdueTasks
        },
        team: {
          size: teamSize
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private
const getRecentActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 10;

    let taskQuery = {};
    if (userRole !== 'admin') {
      taskQuery = {
        $or: [
          { assignee: userId },
          { assignedBy: userId }
        ]
      };
    }

    // Get recent tasks
    const recentTasks = await Task.find(taskQuery)
      .populate('project', 'name')
      .populate('assignee', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit);

    // Get upcoming deadlines
    const upcomingDeadlines = await Task.find({
      ...taskQuery,
      dueDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      },
      status: { $ne: 'completed' }
    })
      .populate('project', 'name')
      .populate('assignee', 'name')
      .sort({ dueDate: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        recentTasks,
        upcomingDeadlines
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project progress data
// @route   GET /api/dashboard/project-progress
// @access  Private
const getProjectProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let projectQuery = {};
    if (userRole !== 'admin') {
      projectQuery = {
        $or: [
          { manager: userId },
          { 'team.user': userId }
        ]
      };
    }

    const projects = await Project.find(projectQuery)
      .select('name progress status startDate endDate')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

router.get('/stats', protect, getDashboardStats);
router.get('/activities', protect, getRecentActivities);
router.get('/project-progress', protect, getProjectProgress);

// @desc    Get employee dashboard data
// @route   GET /api/dashboard/employee
// @access  Private
const getEmployeeDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's pending policies count
    const PolicyAcknowledgment = require('../models/PolicyAcknowledgment');
    const Policy = require('../models/Policy');

    const acknowledgedPolicies = await PolicyAcknowledgment.find({ user: userId }).select('policy');
    const acknowledgedPolicyIds = acknowledgedPolicies.map(ack => ack.policy);

    const pendingPolicies = await Policy.countDocuments({
      _id: { $nin: acknowledgedPolicyIds },
      isActive: true
    });

    // Get unread notifications count
    const Notification = require('../models/Notification');
    const unreadNotifications = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    // Get user's completed tasks count
    const completedTasks = await Task.countDocuments({
      assignee: userId,
      status: 'completed'
    });

    // Mock training due count (would need a training module)
    const trainingDue = 2;

    res.status(200).json({
      success: true,
      data: {
        pendingPolicies,
        trainingDue,
        unreadNotifications,
        completedTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

router.get('/employee', protect, getEmployeeDashboard);

module.exports = router;
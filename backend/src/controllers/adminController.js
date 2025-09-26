const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Policy = require('../models/Policy');
const Training = require('../models/Training');
const TrainingEnrollment = require('../models/TrainingEnrollment');
const AuditLog = require('../models/AuditLog');
const EducationContent = require('../models/EducationContent');
const Quiz = require('../models/Quiz');
const PhishingCampaign = require('../models/PhishingCampaign');

// @desc    Get admin dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardMetrics = async (req, res) => {
  try {
    // Get current date for filtering
    const currentDate = new Date();
    const currentUser = req.user;
    
    // Get basic employee counts
    const totalEmployees = await User.countDocuments({ isActive: true });
    const newEmployeesThisMonth = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) }
    });
    
    // Get content metrics
    const totalContent = await EducationContent.countDocuments({ isArchived: false });
    const activeContent = await EducationContent.countDocuments({ 
      status: 'published', 
      isArchived: false 
    });
    
    // Get quiz metrics
    const totalQuizzes = await Quiz.countDocuments({ isArchived: false });
    const publishedQuizzes = await Quiz.countDocuments({ 
      status: 'published', 
      isArchived: false 
    });
    
    // Get phishing campaign metrics
    const totalCampaigns = await PhishingCampaign.countDocuments({ isArchived: false });
    const activeCampaigns = await PhishingCampaign.countDocuments({ 
      status: { $in: ['active', 'scheduled'] },
      isArchived: false 
    });
    
    // Get employee roles distribution
    const employeesByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivities = await AuditLog.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Get quiz completion stats
    const quizCompletions = await Quiz.aggregate([
      { $match: { status: 'published', isArchived: false } },
      { 
        $group: {
          _id: null,
          totalAttempts: { $sum: '$metadata.totalAttempts' },
          totalCompletions: { $sum: '$metadata.completions' },
          avgScore: { $avg: '$metadata.averageScore' }
        }
      }
    ]);
    
    const quizStats = quizCompletions[0] || {
      totalAttempts: 0,
      totalCompletions: 0,
      avgScore: 0
    };
    
    // Get phishing campaign effectiveness
    const phishingStats = await PhishingCampaign.aggregate([
      { $match: { status: { $in: ['completed', 'active'] }, isArchived: false } },
      {
        $group: {
          _id: null,
          totalSent: { $sum: '$metrics.totalSent' },
          totalClicked: { $sum: '$metrics.totalClicked' },
          totalReported: { $sum: '$metrics.totalReported' },
          avgClickRate: { $avg: '$metrics.clickRate' },
          avgReportRate: { $avg: '$metrics.reportRate' }
        }
      }
    ]);
    
    const phishingMetrics = phishingStats[0] || {
      totalSent: 0,
      totalClicked: 0,
      totalReported: 0,
      avgClickRate: 0,
      avgReportRate: 0
    };
    
    // Get email engagement trends (mock data for demonstration)
    const emailEngagementTrends = {
      weekly: [
        { period: '2025-38', value: 85 },
        { period: '2025-39', value: 92 },
        { period: '2025-40', value: 78 },
        { period: '2025-41', value: 88 },
        { period: '2025-42', value: 95 }
      ]
    };
    
    // Get system health metrics
    const systemHealth = {
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000) // Mock last backup
    };
    
    const dashboardData = {
      // Main metrics cards
      overview: {
        employees: totalEmployees,
        activeContent: activeContent,
        publishedQuizzes: publishedQuizzes,
        phishingCampaigns: totalCampaigns,
        newEmployeesThisMonth,
        totalContent,
        totalQuizzes,
        activeCampaigns,
        recentActivities
      },
      
      // Employee distribution
      employeesByRole: employeesByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      
      // Quiz and training metrics
      quizMetrics: {
        totalAttempts: quizStats.totalAttempts,
        completionRate: quizStats.totalAttempts > 0 
          ? Math.round((quizStats.totalCompletions / quizStats.totalAttempts) * 100)
          : 0,
        averageScore: Math.round(quizStats.avgScore || 0)
      },
      
      // Phishing simulation metrics
      phishingMetrics: {
        totalSent: phishingMetrics.totalSent,
        clickRate: Math.round(phishingMetrics.avgClickRate || 0),
        reportRate: Math.round(phishingMetrics.avgReportRate || 0),
        totalCampaigns
      },
      
      // Email engagement trends
      emailEngagement: emailEngagementTrends,
      
      // Quick links data
      quickLinks: {
        manageEmployees: '/admin/employees',
        manageContent: '/admin/content',
        manageQuizzes: '/admin/quizzes',
        phishingSimulation: '/admin/phishing',
        policyManagement: '/admin/policies',
        editProfile: '/admin/profile'
      },
      
      // System information
      systemHealth,
      
      // Current user info
      currentUser: {
        name: currentUser.name,
        role: currentUser.role,
        lastLogin: currentUser.lastLogin
      }
    };
    
    // Log the dashboard access
    await AuditLog.createLog({
      user: req.user.id,
      action: 'View admin dashboard',
      actionType: 'READ',
      resource: 'SYSTEM',
      details: 'Accessed admin dashboard metrics',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard metrics',
      error: error.message
    });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get activity statistics
    const activityStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            actionType: '$actionType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    // Get login statistics
    const loginStats = await AuditLog.aggregate([
      { 
        $match: { 
          actionType: 'LOGIN',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        period,
        activityStats,
        loginStats
      }
    });
    
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardMetrics,
  getSystemStats
};
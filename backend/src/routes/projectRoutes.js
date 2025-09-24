const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin', 'manager'), createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/team')
  .post(protect, authorize('admin', 'manager'), addTeamMember);

module.exports = router;
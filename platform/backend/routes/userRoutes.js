const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUser, 
  getStudentsByClass,
  updateUser, 
  deleteUser,
  getDashboardStats 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @route   GET /api/users
router.get('/', authorize('teacher', 'management'), getUsers);

// @route   GET /api/users/dashboard/stats
router.get('/dashboard/stats', authorize('management'), getDashboardStats);

// @route   GET /api/users/class/:classId
router.get('/class/:classId', authorize('teacher', 'management'), getStudentsByClass);

// @route   GET /api/users/:id
router.get('/:id', authorize('teacher', 'management'), getUser);

// @route   PUT /api/users/:id
router.put('/:id', authorize('management'), updateUser);

// @route   DELETE /api/users/:id
router.delete('/:id', authorize('management'), deleteUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  getAttendance, 
  markAttendance, 
  bulkMarkAttendance, 
  getAttendanceStats,
  getAttendanceById,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @route   GET /api/attendance
router.get('/', getAttendance);

// @route   GET /api/attendance/stats
router.get('/stats', getAttendanceStats);

// @route   GET /api/attendance/:id
router.get('/:id', getAttendanceById);

// @route   POST /api/attendance
router.post('/', authorize('teacher', 'management'), markAttendance);

// @route   POST /api/attendance/bulk
router.post('/bulk', authorize('teacher', 'management'), bulkMarkAttendance);

// @route   DELETE /api/attendance/:id
router.delete('/:id', authorize('management'), deleteAttendance);

module.exports = router;

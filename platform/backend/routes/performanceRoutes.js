const express = require('express');
const router = express.Router();
const { 
  getPerformance, 
  submitQuiz, 
  getPerformanceStats,
  aiQuery 
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @route   GET /api/performance
router.get('/', getPerformance);

// @route   GET /api/performance/stats
router.get('/stats', getPerformanceStats);

// @route   POST /api/performance/submit-quiz
router.post('/submit-quiz', authorize('student'), submitQuiz);

// @route   POST /api/performance/ai-query
router.post('/ai-query', authorize('teacher', 'management'), aiQuery);

module.exports = router;

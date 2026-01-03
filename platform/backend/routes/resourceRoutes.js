const express = require('express');
const router = express.Router();
const { 
  uploadResource, 
  getResources, 
  getResource, 
  generateQuiz, 
  generateLessonPlan,
  deleteResource 
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes are protected
router.use(protect);

// @route   GET /api/resources
router.get('/', getResources);

// @route   GET /api/resources/:id
router.get('/:id', getResource);

// @route   POST /api/resources/upload
router.post('/upload', authorize('teacher', 'management'), upload.single('file'), uploadResource);

// @route   POST /api/resources/:id/generate-quiz
router.post('/:id/generate-quiz', authorize('teacher', 'management'), generateQuiz);

// @route   POST /api/resources/:id/generate-lesson-plan
router.post('/:id/generate-lesson-plan', authorize('teacher', 'management'), generateLessonPlan);

// @route   DELETE /api/resources/:id
router.delete('/:id', authorize('teacher', 'management'), deleteResource);

module.exports = router;

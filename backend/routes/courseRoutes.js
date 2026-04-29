const express = require('express');
const router = express.Router();
const {
  getCourses, createCourse, updateCourse, deleteCourse, getCourseSubjects,
  getSubjects, createSubject, updateSubject, deleteSubject,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Course routes
router.get('/', getCourses);
router.post('/', authorize('admin'), createCourse);
router.put('/:id', authorize('admin'), updateCourse);
router.delete('/:id', authorize('admin'), deleteCourse);
router.get('/:id/subjects', getCourseSubjects);

// Subject routes (nested under /api/subjects for convenience too)
module.exports = router;

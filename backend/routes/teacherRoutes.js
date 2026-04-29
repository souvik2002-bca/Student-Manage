const express = require('express');
const router = express.Router();
const {
  getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher, getMyProfile,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', authorize('teacher'), getMyProfile);
router.get('/', authorize('admin'), getTeachers);
router.get('/:id', authorize('admin'), getTeacher);
router.post('/', authorize('admin'), createTeacher);
router.put('/:id', authorize('admin'), updateTeacher);
router.delete('/:id', authorize('admin'), deleteTeacher);

module.exports = router;

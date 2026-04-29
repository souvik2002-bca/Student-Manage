const express = require('express');
const router = express.Router();
const {
  getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMyProfile,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/me', authorize('student'), getMyProfile);
router.get('/', authorize('admin', 'teacher'), getStudents);
router.get('/:id', authorize('admin', 'teacher'), getStudent);
router.post('/', authorize('admin'), upload.single('photo'), createStudent);
router.put('/:id', authorize('admin'), upload.single('photo'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;

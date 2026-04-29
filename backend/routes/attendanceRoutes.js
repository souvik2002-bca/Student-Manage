const express = require('express');
const router = express.Router();
const {
  markAttendance, getAttendance, updateAttendance, deleteAttendance, getStudentAttendanceReport,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'teacher'), getAttendance);
router.post('/bulk', authorize('admin', 'teacher'), markAttendance);
router.get('/report/:studentId', getStudentAttendanceReport);
router.put('/:id', authorize('admin', 'teacher'), updateAttendance);
router.delete('/:id', authorize('admin'), deleteAttendance);

module.exports = router;

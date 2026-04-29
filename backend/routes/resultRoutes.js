const express = require('express');
const router = express.Router();
const {
  addResult, getResults, getStudentResults, updateResult, deleteResult,
} = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'teacher'), getResults);
router.post('/', authorize('admin', 'teacher'), addResult);
router.get('/student/:studentId', getStudentResults);
router.put('/:id', authorize('admin', 'teacher'), updateResult);
router.delete('/:id', authorize('admin'), deleteResult);

module.exports = router;

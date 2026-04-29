const express = require('express');
const router = express.Router();
const {
  getFees, createFee, payFee, updateFee, deleteFee, getFeeSummary,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', authorize('admin'), getFeeSummary);
router.get('/', authorize('admin', 'student'), getFees);
router.post('/', authorize('admin'), createFee);
router.put('/:id/pay', authorize('admin'), payFee);
router.put('/:id', authorize('admin'), updateFee);
router.delete('/:id', authorize('admin'), deleteFee);

module.exports = router;

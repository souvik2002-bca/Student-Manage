const Fee = require('../models/Fee');
const { generateReceiptNo } = require('../utils/helpers');

// @GET /api/fees
exports.getFees = async (req, res) => {
  const { student, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (student) filter.student = student;
  if (status) filter.status = status;

  const fees = await Fee.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('collectedBy', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Fee.countDocuments(filter);
  res.json({ success: true, data: fees, total });
};

// @POST /api/fees
exports.createFee = async (req, res) => {
  const fee = await Fee.create({ ...req.body, collectedBy: req.user.id });
  await fee.populate({ path: 'student', populate: { path: 'user', select: 'name' } });
  res.status(201).json({ success: true, data: fee });
};

// @PUT /api/fees/:id/pay  - mark fee as paid
exports.payFee = async (req, res) => {
  const { paymentMethod } = req.body;
  const receiptNo = generateReceiptNo();

  const fee = await Fee.findByIdAndUpdate(
    req.params.id,
    { status: 'Paid', paidDate: new Date(), paymentMethod, receiptNo, collectedBy: req.user.id },
    { new: true }
  ).populate({ path: 'student', populate: { path: 'user', select: 'name' } });

  if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
  res.json({ success: true, data: fee });
};

// @PUT /api/fees/:id
exports.updateFee = async (req, res) => {
  const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: fee });
};

// @DELETE /api/fees/:id
exports.deleteFee = async (req, res) => {
  await Fee.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Fee record deleted' });
};

// @GET /api/fees/summary  - total collected, pending
exports.getFeeSummary = async (req, res) => {
  const paid = await Fee.aggregate([
    { $match: { status: 'Paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const pending = await Fee.aggregate([
    { $match: { status: 'Pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  res.json({
    success: true,
    data: {
      totalCollected: paid[0]?.total || 0,
      totalPending: pending[0]?.total || 0,
    },
  });
};

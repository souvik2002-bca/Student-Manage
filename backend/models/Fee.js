const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    feeType: { type: String, enum: ['Tuition', 'Exam', 'Library', 'Lab', 'Transport', 'Other'], default: 'Tuition' },
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    paidDate: { type: Date },
    status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Online', 'Cheque'], default: 'Cash' },
    receiptNo: { type: String, unique: true, sparse: true },
    remarks: { type: String },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);

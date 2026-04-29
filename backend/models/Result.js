const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    examType: { type: String, enum: ['Midterm', 'Final', 'Quiz', 'Assignment'], default: 'Final' },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, default: 100 },
    grade: { type: String },
    gpa: { type: Number },
    remarks: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);

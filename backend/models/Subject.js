const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    creditHours: { type: Number, default: 3 },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);

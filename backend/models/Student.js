const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: String, required: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    phone: { type: String },
    address: { type: String },
    guardianName: { type: String },
    guardianPhone: { type: String },
    photo: { type: String, default: '' },
    enrollmentDate: { type: Date, default: Date.now },
    plainPassword: { type: String }, // stored once for admin display, should be cleared
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);

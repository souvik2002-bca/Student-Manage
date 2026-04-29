const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Fee = require('../models/Fee');

// @GET /api/dashboard/admin
exports.getAdminDashboard = async (req, res) => {
  const [totalStudents, totalTeachers, totalCourses, feeSummary, recentStudents] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Teacher.countDocuments({ isActive: true }),
    Course.countDocuments({ isActive: true }),
    Fee.aggregate([
      { $group: { _id: '$status', total: { $sum: '$amount' } } },
    ]),
    Student.find().populate('user', 'name email').populate('course', 'name').sort({ createdAt: -1 }).limit(5),
  ]);

  const feeData = { collected: 0, pending: 0 };
  feeSummary.forEach((f) => {
    if (f._id === 'Paid') feeData.collected = f.total;
    if (f._id === 'Pending') feeData.pending = f.total;
  });

  // Monthly student enrollment for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const enrollmentData = await Student.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Course-wise student count for pie chart
  const courseData = await Student.aggregate([
    { $match: { course: { $ne: null } } },
    { $group: { _id: '$course', count: { $sum: 1 } } },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
    { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
    { $project: { name: '$course.name', count: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      stats: { totalStudents, totalTeachers, totalCourses, ...feeData },
      recentStudents,
      enrollmentData,
      courseData,
    },
  });
};

// @GET /api/dashboard/teacher
exports.getTeacherDashboard = async (req, res) => {
  const Teacher = require('../models/Teacher');
  const teacher = await Teacher.findOne({ user: req.user.id }).populate('subjects');
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

  const subjectIds = teacher.subjects.map((s) => s._id);

  const [attendanceCount, resultCount] = await Promise.all([
    Attendance.countDocuments({ subject: { $in: subjectIds } }),
    Result.countDocuments({ subject: { $in: subjectIds } }),
  ]);

  res.json({
    success: true,
    data: { teacher, subjects: teacher.subjects, attendanceCount, resultCount },
  });
};

// @GET /api/dashboard/student
exports.getStudentDashboard = async (req, res) => {
  const student = await Student.findOne({ user: req.user.id }).populate('user', 'name email username').populate('course');
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const [attendance, results, fees] = await Promise.all([
    Attendance.find({ student: student._id }).populate('subject', 'name'),
    Result.find({ student: student._id }).populate('subject', 'name'),
    Fee.find({ student: student._id }),
  ]);

  const totalAtt = attendance.length;
  const presentAtt = attendance.filter((a) => a.status === 'Present').length;
  const attendancePercent = totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(1) : 0;

  const totalFees = fees.reduce((a, f) => a + f.amount, 0);
  const paidFees = fees.filter((f) => f.status === 'Paid').reduce((a, f) => a + f.amount, 0);

  res.json({
    success: true,
    data: { student, attendancePercent, totalAtt, presentAtt, resultCount: results.length, totalFees, paidFees },
  });
};

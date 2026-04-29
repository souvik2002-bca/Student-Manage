const Result = require('../models/Result');
const Student = require('../models/Student');
const { calculateGrade } = require('../utils/helpers');

// @POST /api/results
exports.addResult = async (req, res) => {
  const { student, subject, examType, marksObtained, totalMarks, remarks } = req.body;
  const { grade, gpa } = calculateGrade((marksObtained / totalMarks) * 100);

  const result = await Result.findOneAndUpdate(
    { student, subject, examType },
    { student, subject, examType, marksObtained, totalMarks, grade, gpa, remarks, uploadedBy: req.user.id },
    { upsert: true, new: true }
  );
  await result.populate([
    { path: 'student', populate: { path: 'user', select: 'name' } },
    'subject',
  ]);
  res.status(201).json({ success: true, data: result });
};

// @GET /api/results
exports.getResults = async (req, res) => {
  const { student, subject, examType, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (student) filter.student = student;
  if (subject) filter.subject = subject;
  if (examType) filter.examType = examType;

  const results = await Result.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'name code')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Result.countDocuments(filter);
  res.json({ success: true, data: results, total });
};

// @GET /api/results/student/:studentId
exports.getStudentResults = async (req, res) => {
  const results = await Result.find({ student: req.params.studentId })
    .populate('subject', 'name code creditHours');

  const totalMarksObtained = results.reduce((a, r) => a + r.marksObtained, 0);
  const totalMarks = results.reduce((a, r) => a + r.totalMarks, 0);
  const overallPercentage = totalMarks > 0 ? ((totalMarksObtained / totalMarks) * 100).toFixed(2) : 0;
  const { grade: overallGrade } = calculateGrade(Number(overallPercentage));

  res.json({ success: true, data: results, summary: { totalMarksObtained, totalMarks, overallPercentage, overallGrade } });
};

// @PUT /api/results/:id
exports.updateResult = async (req, res) => {
  const { marksObtained, totalMarks } = req.body;
  if (marksObtained !== undefined && totalMarks !== undefined) {
    const { grade, gpa } = calculateGrade((marksObtained / totalMarks) * 100);
    req.body.grade = grade;
    req.body.gpa = gpa;
  }
  const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: result });
};

// @DELETE /api/results/:id
exports.deleteResult = async (req, res) => {
  await Result.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Result deleted' });
};

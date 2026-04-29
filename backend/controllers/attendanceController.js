const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @POST /api/attendance/bulk  - mark attendance for a list of students
exports.markAttendance = async (req, res) => {
  const { subject, date, records } = req.body;
  // records: [{ student, status, remarks }]
  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, subject, date: new Date(date) },
      update: { $set: { student: r.student, subject, date: new Date(date), status: r.status, remarks: r.remarks, markedBy: req.user.id } },
      upsert: true,
    },
  }));
  await Attendance.bulkWrite(ops);
  res.json({ success: true, message: 'Attendance marked successfully' });
};

// @GET /api/attendance  - with filters
exports.getAttendance = async (req, res) => {
  const { subject, student, date, startDate, endDate, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (subject) filter.subject = subject;
  if (student) filter.student = student;
  if (date) filter.date = new Date(date);
  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const records = await Attendance.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'name code')
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Attendance.countDocuments(filter);
  res.json({ success: true, data: records, total });
};

// @PUT /api/attendance/:id
exports.updateAttendance = async (req, res) => {
  const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
  res.json({ success: true, data: record });
};

// @DELETE /api/attendance/:id
exports.deleteAttendance = async (req, res) => {
  await Attendance.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Attendance record deleted' });
};

// @GET /api/attendance/report/:studentId  - attendance summary per student
exports.getStudentAttendanceReport = async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const records = await Attendance.find({ student: req.params.studentId })
    .populate('subject', 'name code');

  // Group by subject
  const summary = {};
  records.forEach((r) => {
    const subId = r.subject._id.toString();
    if (!summary[subId]) {
      summary[subId] = { subject: r.subject, total: 0, present: 0, absent: 0, late: 0 };
    }
    summary[subId].total++;
    if (r.status === 'Present') summary[subId].present++;
    else if (r.status === 'Absent') summary[subId].absent++;
    else if (r.status === 'Late') summary[subId].late++;
  });

  const result = Object.values(summary).map((s) => ({
    ...s,
    percentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : 0,
  }));

  res.json({ success: true, data: result });
};

const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { generateEmployeeId, generatePassword } = require('../utils/helpers');

// @GET /api/teachers
exports.getTeachers = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const teachers = await Teacher.find()
    .populate({ path: 'user', match: search ? { name: { $regex: search, $options: 'i' } } : {} })
    .populate({ path: 'subjects', populate: { path: 'course' } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const filtered = teachers.filter((t) => t.user);
  const total = await Teacher.countDocuments();
  res.json({ success: true, data: filtered, total, pages: Math.ceil(total / limit) });
};

// @GET /api/teachers/:id
exports.getTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('user', '-password')
    .populate({ path: 'subjects', populate: { path: 'course' } });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  res.json({ success: true, data: teacher });
};

// @POST /api/teachers
exports.createTeacher = async (req, res) => {
  const { name, email, qualification, specialization, phone, address, subjects } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  const employeeId = await generateEmployeeId(Teacher);
  const plainPassword = generatePassword();
  const username = `tch${employeeId.split('-').pop()}`;

  const user = await User.create({ name, email, username, password: plainPassword, role: 'teacher' });

  const teacher = await Teacher.create({
    user: user._id,
    employeeId,
    qualification,
    specialization,
    phone,
    address,
    subjects: subjects || [],
  });

  // Update subjects with this teacher
  if (subjects && subjects.length > 0) {
    await Subject.updateMany({ _id: { $in: subjects } }, { teacher: teacher._id });
  }

  await teacher.populate(['user', 'subjects']);

  res.status(201).json({
    success: true,
    data: teacher,
    credentials: { username, password: plainPassword, employeeId },
  });
};

// @PUT /api/teachers/:id
exports.updateTeacher = async (req, res) => {
  const { name, email, qualification, specialization, phone, address, subjects, isActive } = req.body;

  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  await User.findByIdAndUpdate(teacher.user, { name, email, isActive });

  const updated = await Teacher.findByIdAndUpdate(
    req.params.id,
    { qualification, specialization, phone, address, subjects, isActive },
    { new: true }
  ).populate(['user', 'subjects']);

  res.json({ success: true, data: updated });
};

// @DELETE /api/teachers/:id
exports.deleteTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  await User.findByIdAndDelete(teacher.user);
  await Teacher.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Teacher deleted successfully' });
};

// @GET /api/teachers/me
exports.getMyProfile = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user.id })
    .populate('user', '-password')
    .populate({ path: 'subjects', populate: { path: 'course' } });
  if (!teacher) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.json({ success: true, data: teacher });
};

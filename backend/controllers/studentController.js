const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
const { generateStudentId, generateUsername, generatePassword } = require('../utils/helpers');

// @GET /api/students
exports.getStudents = async (req, res) => {
  const { page = 1, limit = 10, search = '', course } = req.query;
  const query = {};
  if (course) query.course = course;

  const students = await Student.find(query)
    .populate({ path: 'user', match: search ? { name: { $regex: search, $options: 'i' } } : {} })
    .populate('course')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const filtered = students.filter((s) => s.user);
  const total = await Student.countDocuments(query);

  res.json({ success: true, data: filtered, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// @GET /api/students/:id
exports.getStudent = async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', '-password')
    .populate('course');
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, data: student });
};

// @POST /api/students
exports.createStudent = async (req, res) => {
  const { name, email, course, dob, gender, phone, address, guardianName, guardianPhone } = req.body;

  // Check email unique
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  // Generate credentials
  const studentId = await generateStudentId(Student);
  const plainPassword = generatePassword();
  const username = generateUsername(name, studentId);

  // Create user
  const user = await User.create({ name, email, username, password: plainPassword, role: 'student' });

  // Create student profile
  const photo = req.file ? `/uploads/${req.file.filename}` : '';
  const student = await Student.create({
    user: user._id,
    studentId,
    course,
    dob,
    gender,
    phone,
    address,
    guardianName,
    guardianPhone,
    photo,
    plainPassword, // admin can see it once
  });

  await student.populate(['user', 'course']);

  res.status(201).json({
    success: true,
    data: student,
    credentials: { username, password: plainPassword, studentId },
    message: 'Student created successfully',
  });
};

// @PUT /api/students/:id
exports.updateStudent = async (req, res) => {
  const { name, email, course, dob, gender, phone, address, guardianName, guardianPhone, isActive } = req.body;

  const student = await Student.findById(req.params.id).populate('user');
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  // Update user
  await User.findByIdAndUpdate(student.user._id, { name, email, isActive });

  // Update student profile
  const updates = { course, dob, gender, phone, address, guardianName, guardianPhone, isActive };
  if (req.file) updates.photo = `/uploads/${req.file.filename}`;

  const updated = await Student.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate('user', '-password')
    .populate('course');

  res.json({ success: true, data: updated });
};

// @DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  await User.findByIdAndDelete(student.user);
  await Student.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Student deleted successfully' });
};

// @GET /api/students/me  (for logged-in student)
exports.getMyProfile = async (req, res) => {
  const student = await Student.findOne({ user: req.user.id })
    .populate('user', '-password')
    .populate('course');
  if (!student) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.json({ success: true, data: student });
};

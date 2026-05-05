const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @POST /api/auth/login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Please provide username and password' });

  const user = await User.findOne({ username }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  if (!user.isActive)
    return res.status(403).json({ success: false, message: 'Account is disabled' });

  const token = signToken(user._id , user.role);

  // Get extra profile info
  let profileId = null;
  if (user.role === 'student') {
    const s = await Student.findOne({ user: user._id });
    profileId = s?._id;
  } else if (user.role === 'teacher') {
    const t = await Teacher.findOne({ user: user._id });
    profileId = t?._id;
  }

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      profileId,
    },
  });
};

// @GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  let extra = null;
  if (user.role === 'student') {
    extra = await Student.findOne({ user: user._id }).populate('course');
  } else if (user.role === 'teacher') {
    extra = await Teacher.findOne({ user: user._id }).populate('subjects');
  }
  res.json({ success: true, user, profile: extra });
};

// @POST /api/auth/admin/seed  - create initial admin (only if no admin exists)
exports.seedAdmin = async (req, res) => {
  const exists = await User.findOne({ role: 'admin' });
  if (exists) return res.status(400).json({ success: false, message: 'Admin already exists' });

  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@sms.com',
    username: 'admin',
    password: 'Admin@1234',
    role: 'admin',
  });
  res.status(201).json({ success: true, message: 'Admin created', username: 'admin', password: 'Admin@1234' });
};

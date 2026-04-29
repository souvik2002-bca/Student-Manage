const Course = require('../models/Course');
const Subject = require('../models/Subject');

// @GET /api/courses
exports.getCourses = async (req, res) => {
  const courses = await Course.find().sort({ name: 1 });
  res.json({ success: true, data: courses });
};

// @POST /api/courses
exports.createCourse = async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, data: course });
};

// @PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  res.json({ success: true, data: course });
};

// @DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Course deleted' });
};

// @GET /api/courses/:id/subjects
exports.getCourseSubjects = async (req, res) => {
  const subjects = await Subject.find({ course: req.params.id })
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } });
  res.json({ success: true, data: subjects });
};

// @GET /api/subjects
exports.getSubjects = async (req, res) => {
  const { course } = req.query;
  const filter = course ? { course } : {};
  const subjects = await Subject.find(filter)
    .populate('course', 'name code')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .sort({ name: 1 });
  res.json({ success: true, data: subjects });
};

// @POST /api/subjects
exports.createSubject = async (req, res) => {
  const subject = await Subject.create(req.body);
  await subject.populate(['course', { path: 'teacher', populate: { path: 'user', select: 'name' } }]);
  res.status(201).json({ success: true, data: subject });
};

// @PUT /api/subjects/:id
exports.updateSubject = async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('course', 'name code')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } });
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
  res.json({ success: true, data: subject });
};

// @DELETE /api/subjects/:id
exports.deleteSubject = async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Subject deleted' });
};

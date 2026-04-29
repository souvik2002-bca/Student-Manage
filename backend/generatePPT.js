const pptx = require('pptxgenjs');

const prs = new pptx();

// Theme colors
const DARK = '1E293B';
const ACCENT = '3B82F6';
const LIGHT = 'F1F5F9';
const WHITE = 'FFFFFF';
const GRAY = '64748B';
const GREEN = '10B981';
const ORANGE = 'F59E0B';

// ── helpers ──────────────────────────────────────────────────────────────────
function titleSlide(title, subtitle) {
  const s = prs.addSlide();
  s.background = { color: DARK };
  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: ACCENT } });
  s.addShape(prs.ShapeType.rect, { x: 0, y: 7.44, w: 10, h: 0.06, fill: { color: ACCENT } });
  s.addText(title, { x: 0.5, y: 2.2, w: 9, h: 1.4, fontSize: 40, bold: true, color: WHITE, align: 'center' });
  if (subtitle) s.addText(subtitle, { x: 0.5, y: 3.7, w: 9, h: 0.7, fontSize: 18, color: '94A3B8', align: 'center' });
  return s;
}

function sectionSlide(title, subtitle) {
  const s = prs.addSlide();
  s.background = { color: ACCENT };
  s.addText(title, { x: 0.5, y: 2.8, w: 9, h: 1, fontSize: 36, bold: true, color: WHITE, align: 'center' });
  if (subtitle) s.addText(subtitle, { x: 0.5, y: 3.9, w: 9, h: 0.6, fontSize: 16, color: 'DBEAFE', align: 'center' });
  return s;
}

function contentSlide(title) {
  const s = prs.addSlide();
  s.background = { color: WHITE };
  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: DARK } });
  s.addText(title, { x: 0.4, y: 0.12, w: 9.2, h: 0.65, fontSize: 22, bold: true, color: WHITE });
  return s;
}

function bullet(s, items, x, y, w, h) {
  const rows = items.map(t => ({ text: t, options: { bullet: { type: 'bullet' }, fontSize: 14, color: DARK, breakLine: true, paraSpaceBefore: 6 } }));
  s.addText(rows, { x, y, w, h, valign: 'top' });
}

function card(s, x, y, w, h, title, body, accent) {
  s.addShape(prs.ShapeType.roundRect, { x, y, w, h, fill: { color: LIGHT }, line: { color: accent || ACCENT, width: 2 }, rectRadius: 0.1 });
  s.addText(title, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.35, fontSize: 12, bold: true, color: accent || ACCENT });
  s.addText(body, { x: x + 0.15, y: y + 0.45, w: w - 0.3, h: h - 0.55, fontSize: 11, color: DARK, valign: 'top', wrap: true });
}

// ── SLIDE 1 – Cover ──────────────────────────────────────────────────────────
const s1 = titleSlide('Student Management\nSystem', 'Complete MERN Stack Application Documentation');
s1.addText('Version 1.0  •  2025', { x: 0.5, y: 5.5, w: 9, h: 0.4, fontSize: 12, color: GRAY, align: 'center' });

// ── SLIDE 2 – Table of Contents ───────────────────────────────────────────────
const s2 = contentSlide('Table of Contents');
const toc = [
  ['01', 'Project Overview', '03'],
  ['02', 'Technology Stack', '04'],
  ['03', 'System Architecture', '05'],
  ['04', 'Database Models', '06'],
  ['05', 'User Roles & Access', '07'],
  ['06', 'Admin Module', '08'],
  ['07', 'Teacher Module', '09'],
  ['08', 'Student Module', '10'],
  ['09', 'API Endpoints', '11'],
  ['10', 'Authentication Flow', '12'],
  ['11', 'Deployment Guide', '13'],
  ['12', 'Login Credentials', '14'],
];
toc.forEach(([no, title, pg], i) => {
  const col = i < 6 ? 0 : 1;
  const row = i % 6;
  const x = col === 0 ? 0.4 : 5.2;
  const y = 1.1 + row * 0.9;
  s2.addShape(prs.ShapeType.roundRect, { x, y, w: 4.5, h: 0.72, fill: { color: LIGHT }, rectRadius: 0.08 });
  s2.addText(no, { x: x + 0.1, y: y + 0.18, w: 0.5, h: 0.35, fontSize: 13, bold: true, color: ACCENT });
  s2.addText(title, { x: x + 0.65, y: y + 0.18, w: 3.4, h: 0.35, fontSize: 13, color: DARK });
  s2.addText(`Slide ${pg}`, { x: x + 3.8, y: y + 0.18, w: 0.6, h: 0.35, fontSize: 10, color: GRAY, align: 'right' });
});

// ── SLIDE 3 – Project Overview ────────────────────────────────────────────────
sectionSlide('01 — Project Overview', 'What is this system?');
const s3 = contentSlide('Project Overview');
s3.addText('The Student Management System (SMS) is a full-stack web application built on the MERN stack that digitizes all core academic operations for an educational institution.', { x: 0.4, y: 1.05, w: 9.2, h: 0.7, fontSize: 13, color: DARK });
const goals = ['Centralized management of students, teachers, courses & subjects', 'Role-based dashboards for Admin, Teacher, and Student', 'Attendance tracking with daily mark/view workflows', 'Marks upload, grading & result reports per subject', 'Fee collection tracking with payment status management', 'Student ID Card generation with QR code', 'JWT-secured REST API backend'];
bullet(s3, goals, 0.4, 1.8, 9.2, 5);

// ── SLIDE 4 – Tech Stack ──────────────────────────────────────────────────────
sectionSlide('02 — Technology Stack', 'MERN + modern tooling');
const s4 = contentSlide('Technology Stack');
const tech = [
  ['MongoDB', 'NoSQL database — stores all application data in JSON-like documents', GREEN],
  ['Express.js', 'Node.js web framework — handles REST API routing & middleware', ACCENT],
  ['React 18', 'Frontend library — builds the SPA with hooks and context API', ORANGE],
  ['Node.js', 'JavaScript runtime — runs the backend server', '8B5CF6'],
  ['JWT Auth', 'JSON Web Tokens — stateless authentication for API security', '06B6D4'],
  ['bcryptjs', 'Password hashing — securely stores all user passwords', 'EF4444'],
];
tech.forEach(([name, desc, color], i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  card(s4, 0.3 + col * 4.85, 1.05 + row * 2.05, 4.5, 1.85, name, desc, color);
});

// ── SLIDE 5 – Architecture ────────────────────────────────────────────────────
sectionSlide('03 — System Architecture', '3-tier client–server architecture');
const s5 = contentSlide('System Architecture');
const layers = [
  { label: 'Presentation Layer', detail: 'React 18 SPA  •  Vite dev server  •  Axios HTTP client  •  React Router v6', color: ACCENT },
  { label: 'Business Logic Layer', detail: 'Express.js REST API  •  JWT Middleware  •  Role-based Authorization  •  bcrypt', color: GREEN },
  { label: 'Data Layer', detail: 'MongoDB (local)  •  Mongoose ODM  •  8 collections  •  Pre-save hooks', color: ORANGE },
];
layers.forEach((l, i) => {
  const y = 1.1 + i * 1.9;
  s5.addShape(prs.ShapeType.roundRect, { x: 0.5, y, w: 9, h: 1.65, fill: { color: l.color }, rectRadius: 0.12 });
  s5.addText(l.label, { x: 0.7, y: y + 0.15, w: 8.6, h: 0.45, fontSize: 16, bold: true, color: WHITE });
  s5.addText(l.detail, { x: 0.7, y: y + 0.6, w: 8.6, h: 0.8, fontSize: 12, color: WHITE });
  if (i < 2) s5.addText('▼', { x: 4.7, y: y + 1.7, w: 0.6, h: 0.3, fontSize: 14, color: GRAY, align: 'center' });
});

// ── SLIDE 6 – Database Models ─────────────────────────────────────────────────
sectionSlide('04 — Database Models', '8 Mongoose collections');
const s6 = contentSlide('Database Models');
const models = [
  ['User', 'name, email, username, password(hashed), role, isActive, avatar'],
  ['Student', 'rollNumber, dateOfBirth, gender, phone, address, course(ref), user(ref)'],
  ['Teacher', 'employeeId, department, phone, subjects[](ref), user(ref)'],
  ['Course', 'name, code, duration, fee'],
  ['Subject', 'name, code, course(ref), teacher(ref), semester'],
  ['Attendance', 'student(ref), subject(ref), date, status (Present/Absent/Late)'],
  ['Result', 'student(ref), subject(ref), marks, maxMarks, grade, remarks'],
  ['Fee', 'student(ref), amount, paidAmount, dueDate, status, semester'],
];
models.forEach(([name, fields], i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  s6.addShape(prs.ShapeType.roundRect, { x: 0.3 + col * 4.85, y: 1.05 + row * 1.55, w: 4.55, h: 1.4, fill: { color: LIGHT }, rectRadius: 0.08 });
  s6.addText(name, { x: 0.5 + col * 4.85, y: 1.12 + row * 1.55, w: 4, h: 0.35, fontSize: 13, bold: true, color: ACCENT });
  s6.addText(fields, { x: 0.5 + col * 4.85, y: 1.5 + row * 1.55, w: 4.2, h: 0.85, fontSize: 9.5, color: DARK, wrap: true });
});

// ── SLIDE 7 – User Roles ──────────────────────────────────────────────────────
sectionSlide('05 — User Roles & Access Control', 'JWT + Role-based authorization');
const s7 = contentSlide('User Roles & Permissions');
const roles = [
  { role: 'Admin', color: '7C3AED', perms: ['Full system access', 'Manage Students & Teachers', 'Manage Courses & Subjects', 'View & manage Fees', 'Attendance oversight', 'Result management'] },
  { role: 'Teacher', color: ACCENT, perms: ['Mark attendance', 'Upload student marks', 'View student performance', 'View assigned subjects'] },
  { role: 'Student', color: GREEN, perms: ['View own attendance', 'View own results', 'View fee status', 'Download ID Card'] },
];
roles.forEach((r, i) => {
  const x = 0.3 + i * 3.15;
  s7.addShape(prs.ShapeType.roundRect, { x, y: 1.0, w: 2.95, h: 5.8, fill: { color: LIGHT }, rectRadius: 0.12 });
  s7.addShape(prs.ShapeType.roundRect, { x, y: 1.0, w: 2.95, h: 0.65, fill: { color: r.color }, rectRadius: 0.12 });
  s7.addText(r.role, { x: x + 0.1, y: 1.08, w: 2.75, h: 0.5, fontSize: 16, bold: true, color: WHITE, align: 'center' });
  r.perms.forEach((p, j) => {
    s7.addText(`✓  ${p}`, { x: x + 0.15, y: 1.85 + j * 0.75, w: 2.65, h: 0.6, fontSize: 11, color: DARK });
  });
});

// ── SLIDE 8 – Admin Module ────────────────────────────────────────────────────
sectionSlide('06 — Admin Module', 'Full control over the system');
const s8 = contentSlide('Admin Module — Features');
const adminFeatures = [
  ['Dashboard', 'Real-time stats: total students, teachers, courses, recent fee payments, attendance summary'],
  ['Manage Students', 'Add, edit, delete students. Assign courses. View full profiles with photo upload'],
  ['Manage Teachers', 'Add, edit, delete teachers. Assign subjects. Track department info'],
  ['Manage Courses', 'Create courses with duration and fee. Link subjects to courses'],
  ['Fee Management', 'Track fee payments per student, mark as paid, view due amounts and pending status'],
  ['Attendance Overview', 'View attendance records across all students and subjects'],
  ['Result Management', 'View & manage uploaded marks and generated grades'],
];
adminFeatures.forEach(([title, desc], i) => {
  const y = 1.05 + i * 0.85;
  s8.addShape(prs.ShapeType.roundRect, { x: 0.3, y, w: 9.4, h: 0.75, fill: { color: LIGHT }, rectRadius: 0.08 });
  s8.addText(title, { x: 0.5, y: y + 0.15, w: 1.8, h: 0.4, fontSize: 12, bold: true, color: ACCENT });
  s8.addText(desc, { x: 2.4, y: y + 0.15, w: 7.1, h: 0.4, fontSize: 11, color: DARK });
});

// ── SLIDE 9 – Teacher Module ──────────────────────────────────────────────────
sectionSlide('07 — Teacher Module', 'Classroom operations');
const s9 = contentSlide('Teacher Module — Features');
const teacherF = [
  ['Dashboard', 'Overview of assigned subjects, total students, today\'s pending attendance tasks'],
  ['Mark Attendance', 'Select subject & date, mark each student as Present / Absent / Late, submit'],
  ['Upload Marks', 'Select subject & student, enter obtained marks and max marks, system auto-grades'],
  ['Student Performance', 'View attendance % and result summary per student for assigned subjects'],
];
teacherF.forEach(([title, desc], i) => {
  card(s9, 0.3, 1.1 + i * 1.65, 9.4, 1.5, title, desc, ACCENT);
});

// ── SLIDE 10 – Student Module ─────────────────────────────────────────────────
sectionSlide('08 — Student Module', 'Self-service portal');
const s10 = contentSlide('Student Module — Features');
const studentF = [
  ['Dashboard', 'Personal overview: course info, attendance %, recent results, due fees at a glance', ACCENT],
  ['My Attendance', 'View subject-wise attendance with present/absent/late breakdown and percentage', GREEN],
  ['My Results', 'Subject-wise marks, grades (A+ to F), semester-wise result history', ORANGE],
  ['My Fees', 'Current fee status, amount paid, due date, and outstanding balance', 'EF4444'],
  ['ID Card', 'Auto-generated student ID card with photo, roll number, course & QR code. Printable', '8B5CF6'],
];
studentF.forEach(([title, desc, color], i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  if (i < 4) card(s10, 0.3 + col * 4.85, 1.05 + row * 2.0, 4.5, 1.8, title, desc, color);
  else card(s10, 0.3, 1.05 + 2 * 2.0, 9.4, 1.8, title, desc, color);
});

// ── SLIDE 11 – API Endpoints ──────────────────────────────────────────────────
sectionSlide('09 — REST API Endpoints', 'Express.js backend routes');
const s11 = contentSlide('API Endpoints Reference');
const apis = [
  ['POST', '/api/auth/login', 'Authenticate user, returns JWT token'],
  ['GET', '/api/auth/me', 'Get current logged-in user profile'],
  ['GET/POST/PUT/DELETE', '/api/students', 'CRUD operations for student records'],
  ['GET/POST/PUT/DELETE', '/api/teachers', 'CRUD operations for teacher records'],
  ['GET/POST/PUT/DELETE', '/api/courses', 'Manage courses and curriculum'],
  ['GET/POST/PUT/DELETE', '/api/subjects', 'Manage subjects per course'],
  ['GET/POST', '/api/attendance', 'Mark and retrieve attendance records'],
  ['GET/POST', '/api/results', 'Upload marks and retrieve result data'],
  ['GET/POST/PUT', '/api/fees', 'Fee tracking and payment status updates'],
  ['GET', '/api/dashboard', 'Aggregated stats for dashboard cards'],
];
apis.forEach(([method, endpoint, desc], i) => {
  const y = 1.05 + i * 0.61;
  const mColor = method.includes('POST') ? GREEN : method.includes('DELETE') ? 'EF4444' : ACCENT;
  s11.addShape(prs.ShapeType.roundRect, { x: 0.3, y, w: 9.4, h: 0.53, fill: { color: LIGHT }, rectRadius: 0.06 });
  s11.addText(method, { x: 0.45, y: y + 0.1, w: 2.1, h: 0.3, fontSize: 9, bold: true, color: mColor });
  s11.addText(endpoint, { x: 2.6, y: y + 0.1, w: 2.8, h: 0.3, fontSize: 9.5, bold: true, color: DARK });
  s11.addText(desc, { x: 5.5, y: y + 0.1, w: 4.1, h: 0.3, fontSize: 9, color: GRAY });
});

// ── SLIDE 12 – Auth Flow ──────────────────────────────────────────────────────
sectionSlide('10 — Authentication Flow', 'JWT-based stateless auth');
const s12 = contentSlide('Authentication Flow');
const steps = [
  ['1', 'User submits username & password on Login Page', ACCENT],
  ['2', 'Frontend POST /api/auth/login via Axios', ACCENT],
  ['3', 'Backend finds user, verifies bcrypt hash', GREEN],
  ['4', 'JWT token signed with JWT_SECRET (7d expiry)', GREEN],
  ['5', 'Token stored in localStorage on client', ORANGE],
  ['6', 'Axios interceptor injects Bearer token on every request', ORANGE],
  ['7', 'protect middleware verifies token on protected routes', '8B5CF6'],
  ['8', 'authorize middleware checks role for restricted endpoints', '8B5CF6'],
];
steps.forEach(([no, text, color], i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.3 + col * 4.85;
  const y = 1.1 + row * 1.55;
  s12.addShape(prs.ShapeType.roundRect, { x, y, w: 4.5, h: 1.35, fill: { color: LIGHT }, rectRadius: 0.1 });
  s12.addShape(prs.ShapeType.ellipse, { x: x + 0.1, y: y + 0.3, w: 0.55, h: 0.55, fill: { color } });
  s12.addText(no, { x: x + 0.1, y: y + 0.3, w: 0.55, h: 0.55, fontSize: 13, bold: true, color: WHITE, align: 'center', valign: 'middle' });
  s12.addText(text, { x: x + 0.8, y: y + 0.2, w: 3.55, h: 0.85, fontSize: 11, color: DARK, valign: 'middle', wrap: true });
});

// ── SLIDE 13 – Deployment Guide ───────────────────────────────────────────────
sectionSlide('11 — Deployment Guide', 'How to run locally');
const s13 = contentSlide('Local Deployment Steps');
const cmds = [
  ['Prerequisites', 'Node.js 18+, MongoDB running locally on port 27017', null],
  ['Clone / Open Project', 'Open folder: Student manage/', null],
  ['Install Backend', 'cd backend  &&  npm install', DARK],
  ['Configure .env', 'MONGO_URI, JWT_SECRET, PORT=5000 already set in backend/.env', null],
  ['Seed Database', 'node resetAdmin.js   (creates admin user with known password)', DARK],
  ['Start Backend', 'npm start   →  server runs on http://localhost:5000', GREEN],
  ['Install Frontend', 'cd ../frontend  &&  npm install', DARK],
  ['Start Frontend', 'npm run dev   →  app runs on http://localhost:5173', GREEN],
];
cmds.forEach(([step, cmd, bg], i) => {
  const y = 1.05 + i * 0.79;
  s13.addShape(prs.ShapeType.roundRect, { x: 0.3, y, w: 9.4, h: 0.7, fill: { color: bg ? bg : LIGHT }, rectRadius: 0.07 });
  s13.addText(step, { x: 0.5, y: y + 0.15, w: 2.2, h: 0.36, fontSize: 11, bold: true, color: bg === DARK ? WHITE : ACCENT });
  s13.addText(cmd, { x: 2.8, y: y + 0.15, w: 6.7, h: 0.36, fontSize: 10.5, color: bg === GREEN ? WHITE : bg === DARK ? '86EFAC' : DARK });
});

// ── SLIDE 14 – Credentials ────────────────────────────────────────────────────
sectionSlide('12 — Login Credentials', 'Default access for testing');
const s14 = contentSlide('Default Login Credentials');
s14.addText('After running node resetAdmin.js, use these credentials to access the system:', { x: 0.4, y: 1.05, w: 9.2, h: 0.5, fontSize: 12, color: GRAY });
const creds = [
  { role: 'Admin', user: 'admin', pass: 'Admin@1234', color: '7C3AED', note: 'Full system access. Create teachers/students from this account.' },
  { role: 'Teacher', user: 'Set by admin', pass: 'Set by admin', color: ACCENT, note: 'Admin creates teacher accounts. Login with assigned username & password.' },
  { role: 'Student', user: 'Set by admin', pass: 'Set by admin', color: GREEN, note: 'Admin creates student accounts. Login with roll number or username.' },
];
creds.forEach((c, i) => {
  const y = 1.65 + i * 1.9;
  s14.addShape(prs.ShapeType.roundRect, { x: 0.3, y, w: 9.4, h: 1.7, fill: { color: LIGHT }, rectRadius: 0.12 });
  s14.addShape(prs.ShapeType.roundRect, { x: 0.3, y, w: 1.4, h: 1.7, fill: { color: c.color }, rectRadius: 0.12 });
  s14.addText(c.role, { x: 0.32, y: y + 0.6, w: 1.36, h: 0.5, fontSize: 14, bold: true, color: WHITE, align: 'center' });
  s14.addText(`Username: ${c.user}`, { x: 1.85, y: y + 0.2, w: 7.7, h: 0.35, fontSize: 12, bold: true, color: DARK });
  s14.addText(`Password: ${c.pass}`, { x: 1.85, y: y + 0.6, w: 7.7, h: 0.35, fontSize: 12, color: DARK });
  s14.addText(c.note, { x: 1.85, y: y + 1.0, w: 7.7, h: 0.5, fontSize: 10, color: GRAY, italics: true });
});

// ── SLIDE 15 – Thank You ──────────────────────────────────────────────────────
const s15 = titleSlide('Thank You', 'Student Management System — Complete Documentation');
s15.addText('Built with ❤️  using MongoDB · Express · React · Node.js', { x: 0.5, y: 5.0, w: 9, h: 0.4, fontSize: 13, color: '94A3B8', align: 'center' });

// ── Save ──────────────────────────────────────────────────────────────────────
prs.writeFile({ fileName: 'SMS_Documentation.pptx' })
  .then(() => { console.log('✅  SMS_Documentation.pptx created successfully!'); process.exit(0); })
  .catch(e => { console.error('❌  Error:', e); process.exit(1); });

// Generate Student ID: STU-YYYY-XXXX
const generateStudentId = async (StudentModel) => {
  const year = new Date().getFullYear();
  const count = await StudentModel.countDocuments();
  const seq = String(count + 1).padStart(4, '0');
  return `STU-${year}-${seq}`;
};

// Generate Employee ID: EMP-YYYY-XXXX
const generateEmployeeId = async (TeacherModel) => {
  const year = new Date().getFullYear();
  const count = await TeacherModel.countDocuments();
  const seq = String(count + 1).padStart(4, '0');
  return `EMP-${year}-${seq}`;
};

// Generate username from name + id suffix
const generateUsername = (name, studentId) => {
  const prefix = name.replace(/\s+/g, '').substring(0, 4).toLowerCase();
  const suffix = studentId.split('-').pop();
  return `${prefix}${suffix}`;
};

// Generate random password
const generatePassword = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Calculate grade from marks
const calculateGrade = (marks) => {
  if (marks >= 90) return { grade: 'A+', gpa: 4.0 };
  if (marks >= 80) return { grade: 'A', gpa: 3.7 };
  if (marks >= 70) return { grade: 'B+', gpa: 3.3 };
  if (marks >= 60) return { grade: 'B', gpa: 3.0 };
  if (marks >= 50) return { grade: 'C', gpa: 2.0 };
  if (marks >= 40) return { grade: 'D', gpa: 1.0 };
  return { grade: 'F', gpa: 0.0 };
};

// Generate receipt number
const generateReceiptNo = () => {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP-${ts}${rand}`;
};

module.exports = {
  generateStudentId,
  generateEmployeeId,
  generateUsername,
  generatePassword,
  calculateGrade,
  generateReceiptNo,
};

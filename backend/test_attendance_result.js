/**
 * ============================================================
 * Student Management System - Attendance & Result Test Script
 * ============================================================
 * Run: node test_attendance_result.js
 * Make sure backend is running on http://localhost:5000
 * ============================================================
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
let TOKEN = '';
let STUDENT_ID = '';
let SUBJECT_ID = '';
let ATTENDANCE_ID = '';
let RESULT_ID = '';

let passed = 0;
let failed = 0;

// ─── Helpers ────────────────────────────────────────────────

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function log(label, passed, message = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${label}${message ? ' → ' + message : ''}`);
}

function section(title) {
  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  📋 ${title}`);
  console.log(`${'═'.repeat(55)}`);
}

function assert(label, condition, detail = '') {
  if (condition) {
    passed++;
    log(label, true);
  } else {
    failed++;
    log(label, false, detail);
  }
}

// ─── Tests ──────────────────────────────────────────────────

async function testHealth() {
  section('1. BACKEND HEALTH CHECK');
  const res = await makeRequest('GET', '/api/health');
  assert('Server is reachable', res.status === 200, `Status: ${res.status}`);
  assert('Health response OK', res.body?.status === 'OK', `Got: ${JSON.stringify(res.body)}`);
}

async function testLogin() {
  section('2. ADMIN LOGIN');
  const res = await makeRequest('POST', '/api/auth/login', { username: 'admin', password: 'Admin@1234' });
  assert('Login succeeds (200/201)', [200, 201].includes(res.status), `Status: ${res.status}`);
  assert('Token received', !!res.body?.data?.token, `Body: ${JSON.stringify(res.body)?.substring(0, 100)}`);
  if (res.body?.data?.token) TOKEN = res.body.data.token;
}

async function testGetSubjects() {
  section('3. FETCH SUBJECTS');
  const res = await makeRequest('GET', '/api/subjects', null, TOKEN);
  assert('Subjects endpoint accessible', res.status === 200, `Status: ${res.status}`);
  const hasSubjects = Array.isArray(res.body?.data) && res.body.data.length > 0;
  assert('Has subjects in DB', hasSubjects, `Count: ${res.body?.data?.length ?? 0}`);
  if (hasSubjects) {
    SUBJECT_ID = res.body.data[0]._id;
    console.log(`     ℹ️  Using subject: "${res.body.data[0].name}" (${SUBJECT_ID})`);
  }
}

async function testGetStudents() {
  section('4. FETCH STUDENTS');
  const res = await makeRequest('GET', '/api/students', null, TOKEN);
  assert('Students endpoint accessible', res.status === 200, `Status: ${res.status}`);
  const hasStudents = Array.isArray(res.body?.data) && res.body.data.length > 0;
  assert('Has students in DB', hasStudents, `Count: ${res.body?.data?.length ?? 0}`);
  if (hasStudents) {
    STUDENT_ID = res.body.data[0]._id;
    console.log(`     ℹ️  Using student: "${res.body.data[0].user?.name || 'Unknown'}" (${STUDENT_ID})`);
  }
}

// ─── ATTENDANCE TESTS ────────────────────────────────────────

async function testMarkAttendance() {
  section('5. MARK ATTENDANCE (Bulk POST)');
  if (!SUBJECT_ID || !STUDENT_ID) {
    console.log('  ⚠️  Skipping: No subject or student found. Please seed data first.');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const payload = {
    subject: SUBJECT_ID,
    date: today,
    records: [
      { student: STUDENT_ID, status: 'Present', remarks: 'On time' }
    ],
  };

  const res = await makeRequest('POST', '/api/attendance/bulk', payload, TOKEN);
  assert('Mark attendance succeeds', res.status === 200, `Status: ${res.status}`);
  assert('Success flag returned', res.body?.success === true, `Body: ${JSON.stringify(res.body)}`);
}

async function testGetAttendance() {
  section('6. GET ATTENDANCE RECORDS');
  const res = await makeRequest('GET', '/api/attendance?limit=10', null, TOKEN);
  assert('GET /api/attendance returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Has data array', Array.isArray(res.body?.data), `Body keys: ${Object.keys(res.body || {})}`);
  
  if (res.body?.data?.length > 0) {
    ATTENDANCE_ID = res.body.data[0]._id;
    const rec = res.body.data[0];
    assert('Record has student populated', !!rec.student, `student: ${JSON.stringify(rec.student)?.substring(0, 60)}`);
    assert('Record has subject populated', !!rec.subject, `subject: ${JSON.stringify(rec.subject)?.substring(0, 60)}`);
    assert('Record has status field', ['Present','Absent','Late'].includes(rec.status), `Status: ${rec.status}`);
    assert('Record has date field', !!rec.date, `Date: ${rec.date}`);
    console.log(`     ℹ️  Found ${res.body.data.length} attendance records`);
  } else {
    console.log('  ⚠️  No attendance records found (mark some via the app first)');
  }
}

async function testFilterAttendanceBySubject() {
  section('7. FILTER ATTENDANCE BY SUBJECT');
  if (!SUBJECT_ID) { console.log('  ⚠️  Skipping: No subject ID'); return; }

  const res = await makeRequest('GET', `/api/attendance?subject=${SUBJECT_ID}&limit=10`, null, TOKEN);
  assert('Filtered attendance returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Filtered data is array', Array.isArray(res.body?.data), `Type: ${typeof res.body?.data}`);
  if (res.body?.data?.length > 0) {
    const allMatchSubject = res.body.data.every(r => r.subject?._id === SUBJECT_ID || r.subject === SUBJECT_ID);
    assert('All records match subject filter', allMatchSubject, `First subject: ${res.body.data[0].subject?._id}`);
  }
}

async function testFilterAttendanceByDate() {
  section('8. FILTER ATTENDANCE BY DATE');
  const today = new Date().toISOString().split('T')[0];
  const res = await makeRequest('GET', `/api/attendance?date=${today}&limit=10`, null, TOKEN);
  assert('Date filter returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Date filter returns array', Array.isArray(res.body?.data), `Type: ${typeof res.body?.data}`);
  console.log(`     ℹ️  Today's attendance records: ${res.body?.data?.length ?? 0}`);
}

async function testUpdateAttendance() {
  section('9. UPDATE ATTENDANCE RECORD');
  if (!ATTENDANCE_ID) { console.log('  ⚠️  Skipping: No attendance ID'); return; }

  const res = await makeRequest('PUT', `/api/attendance/${ATTENDANCE_ID}`, { status: 'Late', remarks: 'Updated via test' }, TOKEN);
  assert('PUT /api/attendance/:id returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Returns success flag', res.body?.success === true, `Body: ${JSON.stringify(res.body)}`);
}

async function testStudentAttendanceReport() {
  section('10. STUDENT ATTENDANCE REPORT');
  if (!STUDENT_ID) { console.log('  ⚠️  Skipping: No student ID'); return; }

  const res = await makeRequest('GET', `/api/attendance/report/${STUDENT_ID}`, null, TOKEN);
  assert('GET /api/attendance/report/:id returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Returns data array', Array.isArray(res.body?.data), `Body: ${JSON.stringify(res.body)?.substring(0, 100)}`);
  
  if (res.body?.data?.length > 0) {
    const sub = res.body.data[0];
    assert('Report has percentage field', sub.percentage !== undefined, `Fields: ${Object.keys(sub)}`);
    assert('Report has total/present/absent', sub.total !== undefined && sub.present !== undefined, `total=${sub.total}, present=${sub.present}`);
    console.log(`     ℹ️  Summary: total=${sub.total}, present=${sub.present}, %=${sub.percentage}%`);
  }
}

// ─── RESULT TESTS ────────────────────────────────────────────

async function testAddResult() {
  section('11. ADD RESULT (POST)');
  if (!SUBJECT_ID || !STUDENT_ID) {
    console.log('  ⚠️  Skipping: No subject or student found');
    return;
  }

  const payload = {
    student: STUDENT_ID,
    subject: SUBJECT_ID,
    examType: 'Midterm',
    marksObtained: 78,
    totalMarks: 100,
    remarks: 'Good performance - test',
  };

  const res = await makeRequest('POST', '/api/results', payload, TOKEN);
  assert('POST /api/results returns 201', res.status === 201, `Status: ${res.status}`);
  assert('Result has _id', !!res.body?.data?._id, `Body: ${JSON.stringify(res.body)?.substring(0, 100)}`);
  assert('Grade auto-calculated', !!res.body?.data?.grade, `Grade: ${res.body?.data?.grade}`);
  assert('GPA auto-calculated', res.body?.data?.gpa !== undefined, `GPA: ${res.body?.data?.gpa}`);
  
  if (res.body?.data) {
    RESULT_ID = res.body.data._id;
    console.log(`     ℹ️  Grade: ${res.body.data.grade}, GPA: ${res.body.data.gpa}, Score: ${res.body.data.marksObtained}/${res.body.data.totalMarks}`);
  }
}

async function testGradeCalculation() {
  section('12. GRADE CALCULATION ACCURACY');
  if (!SUBJECT_ID || !STUDENT_ID) { console.log('  ⚠️  Skipping: No subject/student'); return; }

  const tests = [
    { marks: 95, expected: 'A+', examType: 'Quiz' },
    { marks: 85, expected: 'A', examType: 'Final' },
    { marks: 45, expected: 'D', examType: 'Assignment' },
  ];

  for (const t of tests) {
    const payload = { student: STUDENT_ID, subject: SUBJECT_ID, examType: t.examType, marksObtained: t.marks, totalMarks: 100 };
    const res = await makeRequest('POST', '/api/results', payload, TOKEN);
    if (res.status === 201) {
      assert(`Grade for ${t.marks}% is ${t.expected}`, res.body?.data?.grade === t.expected, `Got: ${res.body?.data?.grade}`);
    } else {
      assert(`Grade test ${t.marks}% (${t.examType}) API call`, false, `Status: ${res.status} - ${JSON.stringify(res.body)}`);
    }
  }
}

async function testGetResults() {
  section('13. GET ALL RESULTS');
  const res = await makeRequest('GET', '/api/results?limit=10', null, TOKEN);
  assert('GET /api/results returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Has data array', Array.isArray(res.body?.data), `Type: ${typeof res.body?.data}`);

  if (res.body?.data?.length > 0) {
    const rec = res.body.data[0];
    assert('Record has student populated', !!rec.student, `student: ${JSON.stringify(rec.student)?.substring(0, 50)}`);
    assert('Record has subject populated', !!rec.subject, `subject: ${JSON.stringify(rec.subject)?.substring(0, 50)}`);
    assert('Record has grade', !!rec.grade, `grade: ${rec.grade}`);
    assert('Record has gpa', rec.gpa !== undefined, `gpa: ${rec.gpa}`);
    console.log(`     ℹ️  Total results in DB: ${res.body.total}`);
  }
}

async function testFilterResultsBySubject() {
  section('14. FILTER RESULTS BY SUBJECT & EXAM TYPE');
  if (!SUBJECT_ID) { console.log('  ⚠️  Skipping'); return; }

  const res = await makeRequest('GET', `/api/results?subject=${SUBJECT_ID}&examType=Midterm`, null, TOKEN);
  assert('Filter by subject+examType returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Filtered results is array', Array.isArray(res.body?.data), `Type: ${typeof res.body?.data}`);
  console.log(`     ℹ️  Midterm results for subject: ${res.body?.data?.length}`);
}

async function testGetStudentResults() {
  section('15. GET STUDENT-SPECIFIC RESULTS');
  if (!STUDENT_ID) { console.log('  ⚠️  Skipping'); return; }

  const res = await makeRequest('GET', `/api/results/student/${STUDENT_ID}`, null, TOKEN);
  assert('GET /api/results/student/:id returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Has data array', Array.isArray(res.body?.data), `Type: ${typeof res.body?.data}`);
  assert('Has summary object', !!res.body?.summary, `Summary: ${JSON.stringify(res.body?.summary)}`);

  if (res.body?.summary) {
    const s = res.body.summary;
    assert('Summary has overallPercentage', s.overallPercentage !== undefined, `percentage: ${s.overallPercentage}`);
    assert('Summary has overallGrade', !!s.overallGrade, `grade: ${s.overallGrade}`);
    console.log(`     ℹ️  Student Summary: ${s.overallPercentage}% → Grade ${s.overallGrade}, Total: ${s.totalMarksObtained}/${s.totalMarks}`);
  }
}

async function testUpdateResult() {
  section('16. UPDATE RESULT');
  if (!RESULT_ID) { console.log('  ⚠️  Skipping: No result ID'); return; }

  const res = await makeRequest('PUT', `/api/results/${RESULT_ID}`, { marksObtained: 92, totalMarks: 100 }, TOKEN);
  assert('PUT /api/results/:id returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Updated grade recalculated', res.body?.data?.grade !== undefined, `Grade: ${res.body?.data?.grade}`);
  if (res.body?.data) {
    console.log(`     ℹ️  Updated: ${res.body.data.marksObtained}/${res.body.data.totalMarks} → Grade: ${res.body.data.grade}`);
  }
}

async function testDeleteAttendance() {
  section('17. DELETE ATTENDANCE RECORD');
  if (!ATTENDANCE_ID) { console.log('  ⚠️  Skipping'); return; }

  const res = await makeRequest('DELETE', `/api/attendance/${ATTENDANCE_ID}`, null, TOKEN);
  assert('DELETE /api/attendance/:id returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Success message returned', res.body?.success === true, `Body: ${JSON.stringify(res.body)}`);
}

async function testDeleteResult() {
  section('18. DELETE RESULT');
  if (!RESULT_ID) { console.log('  ⚠️  Skipping'); return; }

  const res = await makeRequest('DELETE', `/api/results/${RESULT_ID}`, null, TOKEN);
  assert('DELETE /api/results/:id returns 200', res.status === 200, `Status: ${res.status}`);
  assert('Success message returned', res.body?.success === true, `Body: ${JSON.stringify(res.body)}`);
}

async function testUnauthorizedAccess() {
  section('19. SECURITY - UNAUTHORIZED ACCESS CHECK');
  const res1 = await makeRequest('GET', '/api/attendance');  // No token
  assert('Attendance requires auth (401/403)', [401, 403].includes(res1.status), `Status: ${res1.status}`);
  
  const res2 = await makeRequest('GET', '/api/results');  // No token
  assert('Results requires auth (401/403)', [401, 403].includes(res2.status), `Status: ${res2.status}`);
}

// ─── Summary ─────────────────────────────────────────────────

async function printSummary() {
  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  📊 TEST SUMMARY`);
  console.log(`${'═'.repeat(55)}`);
  const total = passed + failed;
  console.log(`  Total Tests : ${total}`);
  console.log(`  ✅ Passed   : ${passed}`);
  console.log(`  ❌ Failed   : ${failed}`);
  const pct = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  console.log(`  Score       : ${pct}%`);
  if (failed === 0) {
    console.log(`\n  🎉 ALL TESTS PASSED! Attendance & Result APIs are fully functional.`);
  } else {
    console.log(`\n  ⚠️  Some tests failed. Check the errors above.`);
  }
  console.log(`${'═'.repeat(55)}\n`);
}

// ─── Main ────────────────────────────────────────────────────

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  Student Management System - API Test Suite          ║');
  console.log('║  Module: Attendance & Result Testing                 ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`  🕐 Started at: ${new Date().toLocaleString()}\n`);

  try {
    await testHealth();
    await testLogin();
    await testGetSubjects();
    await testGetStudents();

    // Attendance Tests
    await testMarkAttendance();
    await testGetAttendance();
    await testFilterAttendanceBySubject();
    await testFilterAttendanceByDate();
    await testUpdateAttendance();
    await testStudentAttendanceReport();

    // Result Tests
    await testAddResult();
    await testGradeCalculation();
    await testGetResults();
    await testFilterResultsBySubject();
    await testGetStudentResults();
    await testUpdateResult();

    // Cleanup
    await testDeleteAttendance();
    await testDeleteResult();

    // Security
    await testUnauthorizedAccess();

  } catch (err) {
    console.error('\n  💥 CRITICAL ERROR:', err.message);
    console.error('  Ensure the backend is running: node server.js');
  }

  await printSummary();
}

run();

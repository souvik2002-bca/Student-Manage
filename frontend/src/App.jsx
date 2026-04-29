import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';

// Admin imports
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageCourses from './pages/admin/ManageCourses';
import ManageAttendance from './pages/admin/ManageAttendance';
import ManageResults from './pages/admin/ManageResults';
import FeeManagement from './pages/admin/FeeManagement';

// Teacher imports
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import UploadMarks from './pages/teacher/UploadMarks';
import StudentPerformance from './pages/teacher/StudentPerformance';

// Student imports
import StudentDashboard from './pages/student/StudentDashboard';
import IDCard from './pages/student/IDCard';
import MyAttendance from './pages/student/MyAttendance';
import MyResults from './pages/student/MyResults';
import MyFees from './pages/student/MyFees';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<ManageStudents />} />
              <Route path="/admin/teachers" element={<ManageTeachers />} />
              <Route path="/admin/courses" element={<ManageCourses />} />
              <Route path="/admin/attendance" element={<ManageAttendance />} />
              <Route path="/admin/results" element={<ManageResults />} />
              <Route path="/admin/fees" element={<FeeManagement />} />
            </Route>
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/attendance" element={<MarkAttendance />} />
              <Route path="/teacher/results" element={<UploadMarks />} />
              <Route path="/teacher/reports" element={<StudentPerformance />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/attendance" element={<MyAttendance />} />
              <Route path="/student/results" element={<MyResults />} />
              <Route path="/student/fees" element={<MyFees />} />
              <Route path="/student/id-card" element={<IDCard />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { BookOpen, Activity, FileCheck, DollarSign } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { student, attendancePercent, totalAtt, presentAtt, resultCount, totalFees, paidFees } = data;

  const summaryCards = [
    { title: 'Attendance', value: `${attendancePercent}%`, subtext: `${presentAtt}/${totalAtt} Days`, icon: <Activity size={24} className="text-blue-500" />, bg: 'bg-blue-100' },
    { title: 'Result Records', value: resultCount, subtext: 'Exams & Quizzes', icon: <FileCheck size={24} className="text-green-500" />, bg: 'bg-green-100' },
    { title: 'Pending Fees', value: `₹${totalFees - paidFees}`, subtext: `Out of ₹${totalFees}`, icon: <DollarSign size={24} className="text-orange-500" />, bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow overflow-hidden">
          {student.photo ? (
            <img src={`http://localhost:5000${student.photo}`} alt={student.user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl text-blue-600 font-bold">{student.user.name.charAt(0)}</span>
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{student.user.name}</h1>
          <p className="text-gray-500 mt-1">Student ID: <span className="font-medium text-gray-700">{student.studentId}</span></p>
          <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium flex items-center">
              <BookOpen size={14} className="mr-1" />
              {student.course?.name || 'No Course Assigned'}
            </span>
            <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
              Enrollment Date: {new Date(student.enrollmentDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-full ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Information grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Personal Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Email</span>
              <span className="text-gray-800 font-medium text-sm">{student.user.email}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Phone</span>
              <span className="text-gray-800 font-medium text-sm">{student.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Date of Birth</span>
              <span className="text-gray-800 font-medium text-sm">{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Gender</span>
              <span className="text-gray-800 font-medium text-sm">{student.gender || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Guardian Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Guardian Name</span>
              <span className="text-gray-800 font-medium text-sm">{student.guardianName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Guardian Phone</span>
              <span className="text-gray-800 font-medium text-sm">{student.guardianPhone || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm mb-1">Address</span>
              <span className="text-gray-800 font-medium text-sm">{student.address || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

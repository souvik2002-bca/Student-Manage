import { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/teacher');
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

  const { teacher, subjects, attendanceCount, resultCount } = data;

  const summaryCards = [
    { title: 'My Subjects', value: subjects.length, icon: <BookOpen size={24} className="text-blue-500" />, bg: 'bg-blue-100' },
    { title: 'Attendance Marked', value: attendanceCount, icon: <Clock size={24} className="text-green-500" />, bg: 'bg-green-100' },
    { title: 'Results Uploaded', value: resultCount, icon: <FileText size={24} className="text-purple-500" />, bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {teacher.user.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Teacher ID: {teacher.employeeId}</p>
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
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Assigned Subjects</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {subjects.map((sub) => (
             <div key={sub._id} className="border border-gray-200 rounded-lg p-5 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800 text-lg">{sub.name}</h3>
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">{sub.code}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Course: {sub.course?.name || 'Assigned'}</p>
             </div>
           ))}
           {subjects.length === 0 && (
             <p className="text-gray-500">No subjects currently assigned to you.</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

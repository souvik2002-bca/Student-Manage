import { useState, useEffect } from 'react';
import { Users, UserCheck, BookOpen, DollarSign } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/admin');
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

  const { stats, enrollmentData, courseData, recentStudents } = data;

  const summaryCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: <Users size={24} className="text-blue-500" />, bg: 'bg-blue-100' },
    { title: 'Total Teachers', value: stats.totalTeachers, icon: <UserCheck size={24} className="text-green-500" />, bg: 'bg-green-100' },
    { title: 'Total Courses', value: stats.totalCourses, icon: <BookOpen size={24} className="text-purple-500" />, bg: 'bg-purple-100' },
    { title: 'Fees Collected', value: `₹${stats.collected}`, icon: <DollarSign size={24} className="text-orange-500" />, bg: 'bg-orange-100' },
  ];

  const enrollmentChartData = enrollmentData.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    students: item.count
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Enrollment (Last 6 Months)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Students by Course</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {courseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Enrollments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Enrollments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium border-b border-gray-100">Student ID</th>
                <th className="p-4 font-medium border-b border-gray-100">Name</th>
                <th className="p-4 font-medium border-b border-gray-100">Email</th>
                <th className="p-4 font-medium border-b border-gray-100">Course</th>
                <th className="p-4 font-medium border-b border-gray-100">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b border-gray-100 text-gray-900 font-medium">{student.studentId}</td>
                  <td className="p-4 border-b border-gray-100 text-gray-700">{student.user?.name}</td>
                  <td className="p-4 border-b border-gray-100 text-gray-500">{student.user?.email}</td>
                  <td className="p-4 border-b border-gray-100 text-gray-700">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                      {student.course?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-100 text-gray-500">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentStudents.length === 0 && (
            <div className="p-8 text-center text-gray-500">No recent enrollments found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

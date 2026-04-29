import { useState, useEffect } from 'react';
import { FileText, CalendarCheck } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const MyAttendance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
       try {
         const profileRes = await api.get('/students/me');
         const studId = profileRes.data.data._id;
         const attRes = await api.get(`/attendance/report/${studId}`);
         setData(attRes.data.data);
       } catch (e) { toast.error('Error loading attendance'); }
       finally { setLoading(false); }
    };
    fetchReports();
  }, []);

  if(loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center"><CalendarCheck className="mr-2 text-indigo-500" /> My Attendance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {data.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
               <div className="p-4 border-b border-gray-50 bg-indigo-50 flex justify-between items-center">
                 <h2 className="font-bold text-gray-800">{item.subject.name}</h2>
                 <span className={`px-2 py-1 rounded text-xs font-bold ${Number(item.percentage) >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.percentage}%</span>
               </div>
               <div className="p-4 grid grid-cols-3 gap-2 text-center">
                 <div><p className="text-xs text-gray-500">Present</p><p className="font-semibold text-green-600">{item.present}</p></div>
                 <div><p className="text-xs text-gray-500">Absent</p><p className="font-semibold text-red-600">{item.absent}</p></div>
                 <div><p className="text-xs text-gray-500">Total</p><p className="font-semibold text-gray-800">{item.total}</p></div>
               </div>
            </div>
         ))}
         {data.length === 0 && (
           <div className="col-span-full p-10 text-center bg-white rounded border border-dashed text-gray-500">No attendance records yet.</div>
         )}
      </div>
    </div>
  );
};
export default MyAttendance;

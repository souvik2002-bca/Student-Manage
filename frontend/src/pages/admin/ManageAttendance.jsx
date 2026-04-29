import { useState, useEffect } from 'react';
import { FileCheck, Search } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ManageAttendance = () => {
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', date: '' });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const resSub = await api.get('/subjects');
      setSubjects(resSub.data.data);
      fetchAttendance();
    } catch (error) { toast.error('Error fetching subjects'); }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = '/attendance?limit=100';
      if (filter.subject) url += `&subject=${filter.subject}`;
      if (filter.date) url += `&date=${filter.date}`;
      const res = await api.get(url);
      setRecords(res.data.data);
    } catch (error) { toast.error('Error fetching attendance'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/attendance/${id}`);
      toast.success('Record deleted');
      fetchAttendance();
    } catch (error) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 md:space-y-0">
        <h1 className="text-xl font-bold text-gray-800 flex items-center"><FileCheck className="mr-2" /> Global Attendance</h1>
        <div className="flex space-x-2 w-full md:w-auto">
          <select className="border p-2 rounded-lg flex-1 md:w-48 text-sm" value={filter.subject} onChange={e => setFilter({...filter, subject: e.target.value})}>
             <option value="">All Subjects</option>
             {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <input type="date" className="border p-2 rounded-lg text-sm" value={filter.date} onChange={e => setFilter({...filter, date: e.target.value})} />
          <button onClick={fetchAttendance} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition"><Search size={18} /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-32 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 font-medium">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Student</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {records.map(rec => (
                <tr key={rec._id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-600">{new Date(rec.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-800">{rec.student?.user?.name}</td>
                  <td className="p-4 text-gray-600">{rec.subject?.name}</td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${rec.status === 'Present' ? 'bg-green-100 text-green-700' : rec.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{rec.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(rec._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Remove</button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default ManageAttendance;

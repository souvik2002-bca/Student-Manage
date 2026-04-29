import { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Save } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ subject: '', date: new Date().toISOString().split('T')[0] });
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
       const res = await api.get('/dashboard/teacher');
       setSubjects(res.data.data.subjects);
    } catch (e) {} finally { setLoading(false); }
  };

  const fetchStudentsForSubject = async (subjectId) => {
    if(!subjectId) return setStudents([]);
    try {
      const sub = subjects.find(s => s._id === subjectId);
      if(!sub) return;
      const res = await api.get(`/students?course=${sub.course?._id || sub.course}`);
      setStudents(res.data.data);
      // Initialize attendance state for all
      const att = {};
      res.data.data.forEach(s => att[s._id] = 'Present');
      setAttendance(att);
    } catch(e) { toast.error('Error fetching students'); }
  };

  const submitAttendance = async () => {
    if(!formData.subject) return toast.error('Select a subject first');
    const records = Object.keys(attendance).map(studentId => ({
      student: studentId,
      status: attendance[studentId],
      remarks: ''
    }));

    try {
      await api.post('/attendance/bulk', { subject: formData.subject, date: formData.date, records });
      toast.success('Attendance successfully saved!');
    } catch (e) { toast.error('Error saving attendance'); }
  };

  if(loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
         <h1 className="text-xl font-bold text-gray-800 flex items-center"><CheckSquare className="mr-2"/> Mark Attendance</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
           <select className="w-full border p-2 rounded-lg" value={formData.subject} onChange={e => {
             setFormData({...formData, subject: e.target.value});
             fetchStudentsForSubject(e.target.value);
           }}>
             <option value="">-- Choose Subject --</option>
             {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
           </select>
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
           <div className="relative">
             <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
             <input type="date" className="w-full border pl-10 p-2 rounded-lg" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
           </div>
         </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700 text-sm">
             Student Roster ({students.length} students)
          </div>
          <ul className="divide-y divide-gray-100">
            {students.map(s => (
              <li key={s._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                 <div>
                   <p className="font-medium text-gray-900">{s.user?.name}</p>
                   <p className="text-xs text-gray-500">{s.studentId}</p>
                 </div>
                 <div className="flex space-x-2">
                   {['Present', 'Absent', 'Late'].map(status => (
                     <button
                       key={status}
                       onClick={() => setAttendance({...attendance, [s._id]: status})}
                       className={`px-3 py-1 rounded text-xs font-semibold ${
                         attendance[s._id] === status 
                           ? (status==='Present'?'bg-green-600 text-white':status==='Absent'?'bg-red-600 text-white':'bg-yellow-500 text-white')
                           : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                       }`}
                     >{status}</button>
                   ))}
                 </div>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t border-gray-100 text-right">
            <button onClick={submitAttendance} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center ml-auto hover:bg-blue-700">
              <Save size={18} className="mr-2" /> Save Attendance File
            </button>
          </div>
        </div>
      )}
      
      {formData.subject && students.length === 0 && (
         <div className="p-10 text-center bg-white rounded-xl border border-dashed text-gray-500">No students found matching this subject's course.</div>
      )}
    </div>
  );
};
export default MarkAttendance;

import { useState, useEffect } from 'react';
import { Target, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const UploadMarks = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ subject: '', examType: 'Final' });
  const [marksForm, setMarksForm] = useState({ studentId: '', marks: '', total: 100, remarks: '' });

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
       const res = await api.get('/dashboard/teacher');
       setSubjects(res.data.data.subjects);
    } catch (e) {} finally { setLoading(false); }
  };

  const fetchRoster = async () => {
    if(!formData.subject) return;
    try {
      const sub = subjects.find(s => s._id === formData.subject);
      if(!sub) return;
      
      // Fetch students for the subject's course
      const resStud = await api.get(`/students?course=${sub.course?._id || sub.course}`);
      setStudents(resStud.data.data);

      // Fetch existing results
      const resRes = await api.get(`/results?subject=${formData.subject}&examType=${formData.examType}`);
      setResults(resRes.data.data);
    } catch(e) { toast.error('Error fetching data'); }
  };

  useEffect(() => {
    fetchRoster();
  }, [formData.subject, formData.examType]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if(!formData.subject || !formData.examType || !marksForm.studentId) return toast.error('Missing fields');
    
    try {
      await api.post('/results', {
        student: marksForm.studentId,
        subject: formData.subject,
        examType: formData.examType,
        marksObtained: Number(marksForm.marks),
        totalMarks: Number(marksForm.total),
        remarks: marksForm.remarks
      });
      toast.success('Marks uploaded!');
      setMarksForm({ ...marksForm, marks: '', remarks: '' }); // reset marks but keep total standard
      fetchRoster();
    } catch (e) { toast.error('Failed to upload marks'); }
  };

  // Helper to check if a student has marks already
  const getExistingResult = (studentId) => {
    return results.find(r => r.student?._id === studentId);
  };

  if(loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center md:space-x-4 space-y-4 md:space-y-0">
         <h1 className="text-xl font-bold text-gray-800 flex items-center min-w-max"><Target className="mr-2 text-red-500"/> Upload Marks</h1>
         
         <div className="flex w-full md:w-auto space-x-2">
           <select className="border p-2 rounded-lg flex-1 md:w-48 text-sm" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
             <option value="">-- Subject --</option>
             {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
           </select>
           <select className="border p-2 rounded-lg flex-1 md:w-32 text-sm" value={formData.examType} onChange={e => setFormData({...formData, examType: e.target.value})}>
             <option value="Final">Final Exam</option>
             <option value="Midterm">Midterm</option>
             <option value="Quiz">Quiz</option>
           </select>
         </div>
      </div>

      {formData.subject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h2 className="font-semibold text-gray-800 mb-4 border-b pb-2">Entry Form</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Student</label>
                <select required className="w-full border p-2 rounded-lg text-sm" value={marksForm.studentId} onChange={e => setMarksForm({...marksForm, studentId: e.target.value})}>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>)}
                </select>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Marks</label>
                  <input type="number" required className="w-full border p-2 rounded-lg text-sm" value={marksForm.marks} onChange={e => setMarksForm({...marksForm, marks: e.target.value})} />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Out Of</label>
                  <input type="number" required className="w-full border p-2 rounded-lg bg-gray-50 text-sm" value={marksForm.total} onChange={e => setMarksForm({...marksForm, total: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Remarks (Optional)</label>
                <input type="text" className="w-full border p-2 rounded-lg text-sm" value={marksForm.remarks} onChange={e => setMarksForm({...marksForm, remarks: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Submit Marks</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700 text-sm flex justify-between">
                <span>Subject Assessment Roster</span>
                <span className="text-blue-600 bg-blue-100 px-2 rounded-full text-xs py-0.5">{results.length} graded</span>
             </div>
             
             <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100 text-xs text-gray-500">
                  <tr>
                    <th className="p-3 font-medium">Student</th>
                    <th className="p-3 font-medium">Score</th>
                    <th className="p-3 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                   {students.map(s => {
                     const existing = getExistingResult(s._id);
                     return (
                       <tr key={s._id} className="hover:bg-gray-50 transition">
                         <td className="p-3">
                           <p className="font-medium text-gray-800">{s.user?.name}</p>
                           <p className="text-xs text-gray-400">{s.studentId}</p>
                         </td>
                         <td className="p-3">
                           {existing ? (
                             <span className="font-medium text-gray-900">{existing.marksObtained} <span className="text-gray-400 font-normal">/ {existing.totalMarks}</span></span>
                           ) : (
                             <span className="text-gray-400 text-xs italic">Ungraded</span>
                           )}
                         </td>
                         <td className="p-3">
                           {existing && (
                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${['A+','A','B+','B'].includes(existing.grade) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {existing.grade}
                             </span>
                           )}
                         </td>
                       </tr>
                     );
                   })}
                   {students.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-gray-500">No students available.</td></tr>}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default UploadMarks;

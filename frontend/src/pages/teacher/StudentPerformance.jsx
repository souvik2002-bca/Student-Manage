import { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const StudentPerformance = () => {
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '' });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const resSub = await api.get('/dashboard/teacher');
      setSubjects(resSub.data.data.subjects);
      fetchResults(resSub.data.data.subjects[0]?._id);
    } catch (error) {}
  };

  const fetchResults = async (subjectId) => {
    if(!subjectId) { setLoading(false); return; }
    setLoading(true);
    setFilter({ subject: subjectId });
    try {
      const res = await api.get(`/results?subject=${subjectId}`);
      setResults(res.data.data);
    } catch (error) { toast.error('Error fetching reports'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 md:space-y-0">
        <h1 className="text-xl font-bold text-gray-800 flex items-center"><FileText className="mr-2" /> Class Performance</h1>
        <div className="flex space-x-2 w-full md:w-auto">
          <select className="border p-2 rounded-lg flex-1 md:w-48 text-sm" value={filter.subject} onChange={e => fetchResults(e.target.value)}>
             <option value="">Select a Subject</option>
             {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-32 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Exam Type</th>
                <th className="p-4">Score</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {results.map(rec => (
                <tr key={rec._id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{rec.student?.user?.name}</td>
                  <td className="p-4 text-gray-600 text-xs">{rec.examType}</td>
                  <td className="p-4 font-medium text-gray-700">{rec.marksObtained} / {rec.totalMarks}</td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${['A+','A','B+','B'].includes(rec.grade) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{rec.grade}</span>
                  </td>
                  <td className="p-4 text-xs text-gray-500">{rec.remarks || '-'}</td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No grading submitted for this subject yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default StudentPerformance;

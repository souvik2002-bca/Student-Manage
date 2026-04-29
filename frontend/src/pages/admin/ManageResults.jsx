import { useState, useEffect } from 'react';
import { BarChart2, Search } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', examType: '' });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const resSub = await api.get('/subjects');
      setSubjects(resSub.data.data);
      fetchResults();
    } catch (error) { toast.error('Error fetching subjects'); }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      let url = '/results?limit=100';
      if (filter.subject) url += `&subject=${filter.subject}`;
      if (filter.examType) url += `&examType=${filter.examType}`;
      const res = await api.get(url);
      setResults(res.data.data);
    } catch (error) { toast.error('Error fetching results'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 md:space-y-0">
        <h1 className="text-xl font-bold text-gray-800 flex items-center"><BarChart2 className="mr-2" /> Global Results</h1>
        <div className="flex space-x-2 w-full md:w-auto">
          <select className="border p-2 rounded-lg flex-1 md:w-40 text-sm" value={filter.subject} onChange={e => setFilter({...filter, subject: e.target.value})}>
             <option value="">All Subjects</option>
             {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select className="border p-2 rounded-lg md:w-32 text-sm" value={filter.examType} onChange={e => setFilter({...filter, examType: e.target.value})}>
             <option value="">All Exams</option><option value="Final">Final</option><option value="Midterm">Midterm</option>
          </select>
          <button onClick={fetchResults} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"><Search size={18}/></button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-32 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Exam</th>
                <th className="p-4">Marks</th>
                <th className="p-4">Grade</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {results.map(rec => (
                <tr key={rec._id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{rec.student?.user?.name}</td>
                  <td className="p-4 text-gray-600">{rec.subject?.name}</td>
                  <td className="p-4 text-gray-500 text-xs">{rec.examType}</td>
                  <td className="p-4 font-semibold text-gray-700">{rec.marksObtained} / {rec.totalMarks}</td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${['A+','A','B+','B'].includes(rec.grade) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{rec.grade}</span>
                  </td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No results found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default ManageResults;

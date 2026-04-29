import { useState, useEffect } from 'react';
import { Target, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
       try {
         // Get the student's profile ID first
         const profileRes = await api.get('/students/me');
         const studId = profileRes.data.data._id;
         
         const resultsRes = await api.get(`/results/student/${studId}`);
         setResults(resultsRes.data.data);
         setSummary(resultsRes.data.summary);
       } catch (e) { toast.error('Error loading results'); }
       finally { setLoading(false); }
    };
    fetchResults();
  }, []);

  if(loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center"><Target className="mr-2 text-indigo-500" /> Academic Results</h1>

      {summary && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 shadow-md text-white grid grid-cols-2 md:grid-cols-4 gap-4">
           <div>
             <p className="text-blue-200 text-sm font-medium mb-1">Overall Percentage</p>
             <p className="text-3xl font-bold">{summary.overallPercentage}%</p>
           </div>
           <div>
             <p className="text-blue-200 text-sm font-medium mb-1">Final Grade</p>
             <p className="text-3xl font-bold">{summary.overallGrade}</p>
           </div>
           <div>
             <p className="text-blue-200 text-sm font-medium mb-1">Total Marks Obtained</p>
             <p className="text-xl font-semibold mt-2">{summary.totalMarksObtained} / {summary.totalMarks}</p>
           </div>
           <div>
             <p className="text-blue-200 text-sm font-medium mb-1">Passed Subjects</p>
             <p className="text-xl font-semibold mt-2">{results.filter(r => !['F', 'D'].includes(r.grade)).length} / {results.length}</p>
           </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
         <table className="w-full text-left">
           <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600 font-medium">
             <tr>
               <th className="p-4">Subject</th>
               <th className="p-4">Exam Type</th>
               <th className="p-4">Marks</th>
               <th className="p-4">Grade</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-50 text-sm">
             {results.map(r => (
               <tr key={r._id} className="hover:bg-gray-50">
                 <td className="p-4 font-medium text-gray-800">{r.subject?.name} <span className="text-xs text-gray-400 font-normal ml-1">({r.subject?.code})</span></td>
                 <td className="p-4 text-gray-600">{r.examType}</td>
                 <td className="p-4"><span className="font-semibold text-gray-900">{r.marksObtained}</span> / {r.totalMarks}</td>
                 <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded font-bold text-xs ${['A+','A','B+','B'].includes(r.grade) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.grade}
                    </span>
                 </td>
               </tr>
             ))}
             {results.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No results published yet.</td></tr>}
           </tbody>
         </table>
      </div>
    </div>
  );
};
export default MyResults;

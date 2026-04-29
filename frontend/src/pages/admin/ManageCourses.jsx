import { useState, useEffect } from 'react';
import { Book, Plus, Trash2, Edit2, X, PlusCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [courseModal, setCourseModal] = useState(false);
  const [subjectModal, setSubjectModal] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);

  const [courseForm, setCourseForm] = useState({ name: '', code: '', duration: '', fee: 0 });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', course: '', creditHours: 3 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCourses, resSubjects] = await Promise.all([
        api.get('/courses'),
        api.get('/subjects')
      ]);
      setCourses(resCourses.data.data);
      setSubjects(resSubjects.data.data);
    } catch (error) {
      toast.error('Failed to load courses data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/courses', courseForm);
      if (res.data.success) {
        toast.success('Course created');
        setCourseModal(false);
        setCourseForm({ name: '', code: '', duration: '', fee: 0 });
        fetchData();
      }
    } catch (error) { toast.error('Failed to create course'); }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/subjects', subjectForm);
      if (res.data.success) {
        toast.success('Subject added');
        setSubjectModal(false);
        setSubjectForm({ name: '', code: '', course: '', creditHours: 3 });
        fetchData();
      }
    } catch (error) { toast.error('Failed to add subject'); }
  };

  const deleteCourse = async (id) => {
    if(!window.confirm('Delete this course? All associated subjects might be affected.')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchData();
    } catch (error) { toast.error('Error deleting course'); }
  };

  const deleteSubject = async (id) => {
    if(!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      fetchData();
    } catch (error) { toast.error('Error deleting subject'); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 flex items-center"><Book className="mr-2" /> Courses & Subjects</h1>
        <button onClick={() => setCourseModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus size={18} /><span>Add Course</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div>
                 <h2 className="text-lg font-bold text-gray-800">{course.name}</h2>
                 <p className="text-sm text-gray-500 font-medium">Code: {course.code} | Duration: {course.duration} | Base Fee: ₹{course.fee}</p>
               </div>
               <button onClick={() => deleteCourse(course._id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
            <div className="p-5 bg-white">
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Subjects</h3>
                 <button 
                   onClick={() => { setSubjectForm({...subjectForm, course: course._id}); setSubjectModal(true); }}
                   className="text-xs text-blue-600 font-medium flex items-center hover:underline"
                 ><PlusCircle size={14} className="mr-1"/> Add Subject</button>
               </div>
               
               <ul className="space-y-2">
                 {subjects.filter(s => s.course?._id === course._id || s.course === course._id).map(sub => (
                   <li key={sub._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                     <div>
                       <p className="text-sm font-medium text-gray-800">{sub.name}</p>
                       <p className="text-xs text-gray-500">Code: {sub.code} | Credits: {sub.creditHours}</p>
                     </div>
                     <button onClick={() => deleteSubject(sub._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                   </li>
                 ))}
                 {subjects.filter(s => s.course?._id === course._id || s.course === course._id).length === 0 && (
                   <li className="text-sm text-gray-400 italic py-2">No subjects configured.</li>
                 )}
               </ul>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full p-10 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <Book size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">No courses exist yet.</p>
            <p className="text-gray-400 text-sm">Add a course to start building the curriculum.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {courseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Add New Course</h2>
              <button onClick={() => setCourseModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Course Name</label><input required className="w-full border p-2 rounded-lg" value={courseForm.name} onChange={e=>setCourseForm({...courseForm, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Course Code</label><input required className="w-full border p-2 rounded-lg" value={courseForm.code} onChange={e=>setCourseForm({...courseForm, code: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Duration</label><input placeholder="e.g. 4 Years" required className="w-full border p-2 rounded-lg" value={courseForm.duration} onChange={e=>setCourseForm({...courseForm, duration: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Base Fee (₹)</label><input type="number" required className="w-full border p-2 rounded-lg" value={courseForm.fee} onChange={e=>setCourseForm({...courseForm, fee: Number(e.target.value)})} /></div>
              </div>
              <div className="pt-4 flex justify-end space-x-3"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create Course</button></div>
            </form>
          </div>
        </div>
      )}

      {subjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Add Subject to Course</h2>
              <button onClick={() => setSubjectModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Subject Name</label><input required className="w-full border p-2 rounded-lg" value={subjectForm.name} onChange={e=>setSubjectForm({...subjectForm, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Subject Code</label><input required className="w-full border p-2 rounded-lg" value={subjectForm.code} onChange={e=>setSubjectForm({...subjectForm, code: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Credit Hours</label><input type="number" required className="w-full border p-2 rounded-lg" value={subjectForm.creditHours} onChange={e=>setSubjectForm({...subjectForm, creditHours: Number(e.target.value)})} /></div>
              <div className="pt-4 flex justify-end space-x-3"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Subject</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageCourses;

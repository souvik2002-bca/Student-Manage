import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Key, X } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credentialsModal, setCredentialsModal] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', qualification: '', specialization: '', phone: '', subjects: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTeachers, resSubjects, resCourses] = await Promise.all([
        api.get('/teachers'),
        api.get('/subjects'),
        api.get('/courses')
      ]);
      setTeachers(resTeachers.data.data);
      setSubjects(resSubjects.data.data);
      setCourses(resCourses.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/teachers', formData);
      if (res.data.success) {
        toast.success('Teacher added successfully');
        setIsModalOpen(false);
        setFormData({ name: '', email: '', qualification: '', specialization: '', phone: '', subjects: [] });
        fetchData();
        setCredentialsModal(res.data.credentials);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add teacher');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success('Teacher deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  // Helper to get subjects by course to group them in the select
  const getSubjectsForCourse = (courseId) => {
    return subjects.filter(s => s.course?._id === courseId || s.course === courseId);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Manage Teachers</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          <span>Add Teacher</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Employee ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Specialization</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                  <td className="p-4 font-medium text-gray-900">{teacher.employeeId}</td>
                  <td className="p-4 text-gray-700">{teacher.user?.name}</td>
                  <td className="p-4 text-gray-500">{teacher.user?.email}</td>
                  <td className="p-4 text-gray-600">{teacher.specialization || 'N/A'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 bg-gray-50 rounded hover:bg-blue-50 transition"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(teacher._id)} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 rounded hover:bg-red-50 transition"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No teachers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Add New Teacher</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" required className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input type="text" className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Ph.D. in Computer Science" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input type="text" className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Data Structures" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                
                <div className="col-span-2 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Subjects (Optional)</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-40 overflow-y-auto">
                    {courses.map(course => (
                      <div key={course._id} className="mb-3 last:mb-0">
                         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{course.name}</h4>
                         <div className="space-y-2">
                            {getSubjectsForCourse(course._id).map(sub => (
                               <label key={sub._id} className="flex items-center space-x-2">
                                 <input 
                                   type="checkbox" 
                                   className="rounded text-blue-600"
                                   checked={formData.subjects.includes(sub._id)}
                                   onChange={(e) => {
                                      if(e.target.checked) setFormData({...formData, subjects: [...formData.subjects, sub._id]});
                                      else setFormData({...formData, subjects: formData.subjects.filter(id => id !== sub._id)});
                                   }}
                                 />
                                 <span className="text-sm text-gray-700">{sub.name} ({sub.code})</span>
                               </label>
                            ))}
                            {getSubjectsForCourse(course._id).length === 0 && <span className="text-xs text-gray-400 italic">No subjects added to this course yet.</span>}
                         </div>
                      </div>
                    ))}
                    {courses.length === 0 && <span className="text-sm text-gray-500">No courses available.</span>}
                  </div>
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mt-2">Note: Employee ID and Login credentials will be automatically generated upon creation.</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg">Create Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {credentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transform scale-100 transition-transform">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Key size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Teacher Added!</h2>
            <p className="text-gray-500 text-sm mb-6">Please securely share these generated credentials with the teacher.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left space-y-3 mb-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Employee ID</span>
                <p className="font-mono text-gray-900 font-bold bg-white px-2 py-1 mt-1 border border-gray-200 rounded">{credentialsModal.employeeId}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Username</span>
                <p className="font-mono text-gray-900 font-bold bg-white px-2 py-1 mt-1 border border-gray-200 rounded">{credentialsModal.username}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Password</span>
                <p className="font-mono text-gray-900 font-bold bg-white px-2 py-1 mt-1 border border-gray-200 rounded text-red-600">{credentialsModal.password}</p>
              </div>
            </div>

            <button onClick={() => setCredentialsModal(null)} className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
              I have noted these down
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;

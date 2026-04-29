import { useState, useEffect } from 'react';
import { DollarSign, Search, CheckCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeForm, setFeeForm] = useState({ student: '', feeType: 'Tuition', amount: 0, dueDate: '' });
  const [paymentModal, setPaymentModal] = useState({ open: false, feeId: null, method: 'Cash' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resFees, resStudents] = await Promise.all([
        api.get('/fees'),
        api.get('/students')
      ]);
      setFees(resFees.data.data);
      setStudents(resStudents.data.data);
    } catch (error) { toast.error('Error fetching fees'); }
    finally { setLoading(false); }
  };

  const handleChargeFee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees', feeForm);
      toast.success('Fee charged successfully');
      setFeeForm({ student: '', feeType: 'Tuition', amount: 0, dueDate: '' });
      fetchData();
    } catch (error) { toast.error('Error charging fee'); }
  };

  const handlePayFee = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/fees/${paymentModal.feeId}/pay`, { paymentMethod: paymentModal.method });
      toast.success('Fee marked as paid!');
      setPaymentModal({ open: false, feeId: null, method: 'Cash' });
      fetchData();
    } catch (error) { toast.error('Error processing payment'); }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
         <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><DollarSign className="mr-2" /> Charge Fee to Student</h2>
         <form onSubmit={handleChargeFee} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Student</label>
              <select required className="w-full border p-2 rounded-lg" value={feeForm.student} onChange={e=>setFeeForm({...feeForm, student: e.target.value})}>
                 <option value="">Select Student</option>
                 {students.map(s => <option key={s._id} value={s._id}>{s.studentId} - {s.user?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fee Type</label>
              <select className="w-full border p-2 rounded-lg" value={feeForm.feeType} onChange={e=>setFeeForm({...feeForm, feeType: e.target.value})}>
                 <option value="Tuition">Tuition</option>
                 <option value="Exam">Exam</option>
                 <option value="Library">Library</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount (₹)</label>
              <input type="number" required className="w-full border p-2 rounded-lg" value={feeForm.amount} onChange={e=>setFeeForm({...feeForm, amount: Number(e.target.value)})} />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Add Fee</button>
         </form>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4 font-medium">Student Info</th>
                <th className="p-4 font-medium">Fee Details</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {fees.map(fee => (
                <tr key={fee._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{fee.student?.user?.name}</p>
                    <p className="text-xs text-gray-500">{fee.student?.studentId}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-800">₹{fee.amount}</p>
                    <p className="text-xs text-gray-500">{fee.feeType}</p>
                  </td>
                  <td className="p-4">
                    {fee.status === 'Paid' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Paid</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">Pending</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {fee.status !== 'Paid' ? (
                      <button onClick={() => setPaymentModal({open: true, feeId: fee._id, method: 'Cash'})} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition text-xs font-medium">Collect Payment</button>
                    ) : (
                      <span className="text-xs text-green-600 flex items-center justify-end"><CheckCircle size={14} className="mr-1"/> Rect: {fee.receiptNo}</span>
                    )}
                  </td>
                </tr>
              ))}
              {fees.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No fee records found.</td></tr>}
            </tbody>
          </table>
       </div>

       {paymentModal.open && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
               <h3 className="text-lg font-bold text-gray-800 mb-4">Process Payment</h3>
               <form onSubmit={handlePayFee}>
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                   <select className="w-full border p-2 rounded-lg" value={paymentModal.method} onChange={e=>setPaymentModal({...paymentModal, method: e.target.value})}>
                     <option value="Cash">Cash</option><option value="Card">Card</option><option value="Online">Online</option>
                   </select>
                 </div>
                 <div className="flex space-x-2">
                   <button type="button" onClick={()=>setPaymentModal({open: false})} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg">Cancel</button>
                   <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Confirm Paid</button>
                 </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};
export default FeeManagement;

import { useState, useEffect } from 'react';
import { DollarSign, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const MyFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
       try {
         const profileRes = await api.get('/students/me');
         const studId = profileRes.data.data._id;
         const res = await api.get(`/fees?student=${studId}`);
         setFees(res.data.data);
       } catch (e) { toast.error('Error loading fees'); }
       finally { setLoading(false); }
    };
    fetchFees();
  }, []);

  if(loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center"><DollarSign className="mr-2 text-indigo-500" /> My Fee History</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
         <table className="w-full text-left">
           <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600 font-medium">
             <tr>
               <th className="p-4">Invoice / Type</th>
               <th className="p-4">Amount</th>
               <th className="p-4">Status</th>
               <th className="p-4">Date / Receipt</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-50 text-sm">
             {fees.map(f => (
               <tr key={f._id} className="hover:bg-gray-50">
                 <td className="p-4 font-medium text-gray-800">{f.feeType}</td>
                 <td className="p-4 text-gray-600">₹{f.amount}</td>
                 <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded font-bold text-xs ${f.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {f.status}
                    </span>
                 </td>
                 <td className="p-4 text-xs text-gray-500">
                   {f.status === 'Paid' ? (
                     <span>Paid on {new Date(f.paidDate).toLocaleDateString()}<br/>Ref: <strong className="text-gray-700">{f.receiptNo}</strong></span>
                   ) : (
                     <span>Awaiting settlement</span>
                   )}
                 </td>
               </tr>
             ))}
             {fees.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No fee instances recorded.</td></tr>}
           </tbody>
         </table>
      </div>
    </div>
  );
};
export default MyFees;

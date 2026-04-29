import { useState, useEffect, useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const IDCard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const res = await api.get('/students/me');
      if (res.data.success) {
        setStudent(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load student profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85.6, 53.98] // Standard ID card size (CR80)
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 53.98, 85.6);
      pdf.save(`${student.studentId}_ID_Card.pdf`);
      toast.success('ID Card downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return <div className="text-center text-gray-500 mt-10">Student data not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student ID Card</h1>
        <div className="flex space-x-3 hide-on-print">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
          >
            <Printer size={18} />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center py-10 bg-gray-100 rounded-xl border border-gray-200 print:bg-white print:border-none print:py-0">
        
        {/* ID Card Wrapper (CR80 vertical size approximately) */}
        <div 
          ref={cardRef} 
          className="w-[320px] bg-white rounded-xl shadow-xl overflow-hidden relative border border-gray-200 id-card-print"
          style={{ height: '508px', fontFamily: "'Inter', sans-serif" }}
        >
          {/* Top Banner section */}
          <div className="bg-blue-700 h-24 text-center flex flex-col justify-center items-center px-4 relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-600 rounded-full opacity-50"></div>
             <div className="absolute -left-6 -top-6 w-20 h-20 bg-blue-800 rounded-full opacity-50"></div>
             
             <h2 className="text-white font-bold text-xl uppercase tracking-wider relative z-10 text-shadow">EXCELLENCE ACADEMY</h2>
             <p className="text-blue-100 text-xs font-medium relative z-10 tracking-widest mt-1">STUDENT IDENTITY CARD</p>
          </div>

          {/* Avatar Section */}
          <div className="relative -mt-12 flex justify-center z-20">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-100 shadow-md flex items-center justify-center overflow-hidden">
               {student.photo ? (
                 <img src={`http://localhost:5000${student.photo}`} crossOrigin="anonymous" alt={student.user.name} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-4xl text-gray-400 font-bold">{student.user.name.charAt(0)}</span>
               )}
            </div>
          </div>

          {/* Student Info */}
          <div className="pt-4 pb-6 px-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wide">{student.user.name}</h3>
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded-full mt-2 mb-4 border border-blue-100">
               {student.studentId}
            </span>

            <div className="text-left space-y-3 w-full bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
              <div className="flex">
                <span className="font-semibold text-gray-600 w-16 text-xs uppercase tracking-wide">Course:</span>
                <span className="font-medium text-gray-900 border-b border-gray-300 flex-1">{student.course?.name || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-gray-600 w-16 text-xs uppercase tracking-wide">D.O.B:</span>
                <span className="font-medium text-gray-900 border-b border-gray-300 flex-1">{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-gray-600 w-16 text-xs uppercase tracking-wide">Phone:</span>
                <span className="font-medium text-gray-900 border-b border-gray-300 flex-1">{student.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="absolute bottom-0 w-full bg-blue-700 py-3 text-center">
             <p className="text-white text-xs font-medium">Valid until: Dec 2028</p>
             <div className="w-full flex justify-center mt-1">
               {/* Decorative Barcode placeholder */}
               <div className="h-6 w-32 flex justify-between space-x-1 px-4 opacity-50">
                  {Array.from({length: 15}).map((_, i) => (
                    <div key={i} className={`bg-white ${i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-2' : 'w-0.5'}`}></div>
                  ))}
               </div>
             </div>
          </div>
        </div>

      </div>

      {/* Print CSS explicitly for hiding buttons and fixing backgrounds */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0;
            padding: 0;
          }
          .hide-on-print, nav, header, aside {
            display: none !important;
          }
          .id-card-print {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default IDCard;

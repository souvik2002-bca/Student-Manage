import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, Users, BookOpen, UserCheck, BarChart2, 
  DollarSign, FileText, Library, LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, setOpen }) => {
  const { user, profile, logout } = useContext(AuthContext);

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { to: '/admin', icon: <Home size={20} />, label: 'Dashboard' },
          { to: '/admin/students', icon: <Users size={20} />, label: 'Manage Students' },
          { to: '/admin/teachers', icon: <UserCheck size={20} />, label: 'Manage Teachers' },
          { to: '/admin/courses', icon: <BookOpen size={20} />, label: 'Manage Courses' },
          { to: '/admin/attendance', icon: <Library size={20} />, label: 'Manage Attendance' },
          { to: '/admin/results', icon: <BarChart2 size={20} />, label: 'Manage Results' },
          { to: '/admin/fees', icon: <DollarSign size={20} />, label: 'Fee Management' },
        ];
      case 'teacher':
        return [
          { to: '/teacher', icon: <Home size={20} />, label: 'Dashboard' },
          { to: '/teacher/attendance', icon: <UserCheck size={20} />, label: 'Mark Attendance' },
          { to: '/teacher/results', icon: <BarChart2 size={20} />, label: 'Upload Marks' },
          { to: '/teacher/reports', icon: <FileText size={20} />, label: 'Student Performance' },
        ];
      case 'student':
        return [
          { to: '/student', icon: <Home size={20} />, label: 'Dashboard' },
          { to: '/student/attendance', icon: <Library size={20} />, label: 'My Attendance' },
          { to: '/student/results', icon: <BarChart2 size={20} />, label: 'My Results' },
          { to: '/student/fees', icon: <DollarSign size={20} />, label: 'My Fees' },
          { to: '/student/id-card', icon: <FileText size={20} />, label: 'ID Card' },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <div className="flex items-center justify-center h-20 border-b border-slate-800">
        <BookOpen className="w-8 h-8 text-blue-400 mr-2" />
        <h1 className="text-2xl font-bold tracking-wider">SMS<span className="text-blue-400">Portal</span></h1>
      </div>

      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden focus:outline-none">
            {user?.avatar ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover"/> : user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/teacher' || link.to === '/student'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {link.icon}
            <span className="font-medium text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

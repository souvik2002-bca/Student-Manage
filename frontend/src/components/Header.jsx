import { Menu, Bell } from 'lucide-react';

const Header = ({ setOpen }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6 z-10">
      <div className="flex items-center">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-4 md:ml-0">
          <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Dashboard</h2>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-blue-600 transition-colors relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;

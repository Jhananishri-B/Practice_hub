import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, TrendingUp, MessageSquare, Trophy, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const studentMenuItems = [
    { path: '/dashboard', label: 'Courses', icon: BookOpen },
    { path: '/progress', label: 'My Progress', icon: TrendingUp },
    { path: '/ai-coach', label: 'AI Coach', icon: MessageSquare },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const adminMenuItems = [
    { path: '/admin/overview', label: 'Overview', icon: Home },
    { path: '/admin/users', label: 'User Management', icon: BookOpen },
    { path: '/admin/courses', label: 'Courses & Questions', icon: BookOpen },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <div className="w-64 bg-gray-50 min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">&gt;_</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">AI Practice Hub</h1>
            {user?.role === 'admin' && (
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            location.pathname.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="px-4 py-2 mb-4">
          <p className="font-semibold text-gray-800">{user?.name || user?.username}</p>
          {user?.role === 'student' && (
            <p className="text-sm text-gray-500">Student</p>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


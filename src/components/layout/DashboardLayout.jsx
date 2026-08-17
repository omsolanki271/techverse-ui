import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, PenTool, 
  MessageSquare, Settings, LogOut, Search, Image as ImageIcon,
  FileEdit, BarChart2, Users, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const NavLink = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`group relative flex items-center justify-center p-3 rounded-full transition-all duration-300 ${
      active 
        ? 'bg-techverse-olive text-techverse-green shadow-sm' 
        : 'text-techverse-green hover:bg-techverse-olive/20'
    }`}
  >
    <Icon size={20} className={active ? '' : 'opacity-70 group-hover:opacity-100'} />
    
    {/* Tooltip */}
    <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-techverse-green text-techverse-eggshell text-xs font-bold px-2 py-1 rounded-sm whitespace-nowrap pointer-events-none z-50 shadow-lg">
      {label}
    </span>
  </Link>
);

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const primaryNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/articles', icon: BookOpen, label: 'My Posts' },
    { to: '/dashboard/drafts', icon: FileEdit, label: 'Drafts' },
    { to: '/dashboard/media', icon: ImageIcon, label: 'My Media' },
    { to: '/dashboard/comments', icon: MessageSquare, label: 'Comments' },
    { to: '/dashboard/authors', icon: Users, label: 'Authors' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-techverse-eggshell font-sans relative">
      
      {/* Floating Header */}
      <header className="fixed top-0 inset-x-0 z-40 h-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
        
        {/* Logo */}
        <div className="pointer-events-auto">
          <Link to="/" className="text-2xl font-black tracking-tighter text-techverse-green hover:opacity-80 transition-opacity">
            TECH<span className="text-techverse-olive">VERSE</span>
          </Link>
        </div>

        {/* User & Actions */}
        <div className="flex items-center space-x-6 pointer-events-auto bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-techverse-green/10 shadow-sm">
          <Link to="/search" className="text-techverse-green opacity-70 hover:opacity-100 transition-opacity">
            <Search size={18} />
          </Link>
          <div className="w-px h-6 bg-techverse-green/20 mx-2"></div>
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-8 h-8 rounded-full border border-techverse-olive/50 group-hover:border-techverse-olive transition-colors bg-techverse-green text-techverse-eggshell flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-techverse-green leading-none">{user?.name || user?.username || 'User'}</div>
              <div className="text-xs text-techverse-green/70">{user?.roles?.[0]?.name || 'USER'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-techverse-green opacity-50 hover:text-red-500 hover:opacity-100 transition-colors ml-2" title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Floating Command Hub (Dock) */}
      <div className="fixed bottom-8 inset-x-0 z-50 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-techverse-green/10 p-2 rounded-full shadow-2xl flex items-center space-x-2">
          
          {primaryNavItems.map(item => (
            <NavLink 
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))}
            />
          ))}

          <div className="w-px h-8 bg-techverse-green/10 mx-2"></div>
          
          {/* Quick Create Action */}
          <Link 
            to="/dashboard/articles/new" 
            className="flex items-center justify-center p-3 rounded-full bg-techverse-green text-techverse-eggshell shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            title="Create New Article"
          >
            <PenTool size={20} />
          </Link>
          
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="pt-28 pb-32 px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto min-h-screen">
        <Outlet />
      </main>
      
    </div>
  );
};

export default DashboardLayout;

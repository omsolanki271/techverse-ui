import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Users, FolderTree,
  MessageSquare, Settings, LogOut, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
      active 
        ? 'bg-techverse-olive text-techverse-green font-medium' 
        : 'text-techverse-eggshell/70 hover:bg-techverse-olive/20 hover:text-techverse-eggshell'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
    { to: '/admin/posts', icon: BookOpen, label: 'Posts' },
    { to: '/admin/comments', icon: MessageSquare, label: 'Comments' },
    { to: '/admin/media', icon: ImageIcon, label: 'Media' },
  ];

  return (
    <div className="flex h-screen bg-techverse-eggshell font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-techverse-green text-techverse-eggshell flex flex-col hidden md:flex shrink-0">
        <div className="p-6">
          <Link to="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity">
            TECH<span className="text-techverse-olive">VERSE</span>
          </Link>
          <div className="mt-2 text-xs font-bold uppercase tracking-wider text-techverse-olive">
            Admin Panel
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <SidebarLink 
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to))}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-techverse-olive/20">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-techverse-olive text-techverse-green flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="text-sm font-bold leading-none">{user?.name || user?.username || 'Admin'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-techverse-green text-techverse-eggshell p-4 flex justify-between items-center shrink-0">
          <Link to="/" className="text-xl font-black tracking-tighter">
            TECH<span className="text-techverse-olive">VERSE</span>
          </Link>
          <div className="text-xs font-bold uppercase text-techverse-olive">Admin</div>
        </header>

        {/* Mobile Nav Scroller */}
        <div className="md:hidden bg-techverse-green border-t border-techverse-olive/20 overflow-x-auto shrink-0 scrollbar-hide">
          <div className="flex p-2 space-x-2">
            {navItems.map(item => (
              <Link 
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md whitespace-nowrap text-sm ${
                  location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to))
                    ? 'bg-techverse-olive text-techverse-green font-bold' 
                    : 'text-techverse-eggshell/70'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
};

export default AdminLayout;

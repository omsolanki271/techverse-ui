import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-techverse-green shadow-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className={`text-2xl font-black tracking-tighter ${isScrolled ? 'text-techverse-eggshell' : 'text-techverse-green'}`}>
              TECH<span className="text-techverse-olive">VERSE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
               <Link 
                key={link.name} 
                to={link.path}
                className={`font-medium text-sm transition-colors hover:text-techverse-olive 
                  ${location.pathname === link.path 
                    ? 'text-techverse-olive' 
                    : isScrolled ? 'text-techverse-eggshell' : 'text-techverse-green'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className={`hover:text-techverse-olive transition-colors ${isScrolled ? 'text-techverse-eggshell' : 'text-techverse-green'}`}>
              <Search size={20} />
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4 ml-2 pl-4">
                <Link to={isAdmin() ? "/admin" : "/dashboard"} className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 rounded-full border border-techverse-olive/50 group-hover:border-techverse-olive transition-colors bg-techverse-olive text-techverse-green flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <span className={`text-sm font-medium hidden lg:block transition-colors ${isScrolled ? 'text-techverse-eggshell' : 'text-techverse-green'}`}>
                    {user?.name || user?.username || 'Profile'}
                  </span>
                </Link>
                <div className="h-6 w-px bg-techverse-olive/30"></div>
                <button 
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-red-400 ${isScrolled ? 'text-techverse-eggshell' : 'text-techverse-green'}`}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-2 border-l border-techverse-green/20 pl-6">
                <Link to="/auth/login" className={`text-sm font-bold transition-colors ${isScrolled ? 'text-techverse-eggshell hover:text-techverse-olive' : 'text-techverse-green hover:text-techverse-olive'}`}>
                  Login
                </Link>
                <Link to="/auth/register" className="btn-primary text-sm px-5 py-2">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`focus:outline-none ${isScrolled ? 'text-techverse-eggshell' : 'text-techverse-green'}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-techverse-green text-techverse-eggshell border-t border-techverse-olive/20 shadow-xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium hover:bg-techverse-olive hover:text-techverse-green transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-techverse-eggshell/20 my-2 pt-2">
                <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-3 text-base font-medium hover:text-techverse-olive">
                  <Search size={20} className="mr-3" /> Search
                </Link>
                
                {user ? (
                  <>
                    <Link to={isAdmin() ? "/admin" : "/dashboard"} onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-3 text-base font-medium hover:text-techverse-olive">
                      <div className="w-6 h-6 mr-3 rounded-full bg-techverse-olive text-techverse-green flex items-center justify-center font-bold text-xs">
                        {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </div>
                      {isAdmin() ? 'Admin Panel' : 'My Profile / Dashboard'}
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center px-3 py-3 text-base font-medium text-red-400 hover:text-red-300">
                      <LogOut size={20} className="mr-3" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 mt-4 px-3">
                    <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-3 bg-white/10 text-techverse-eggshell rounded-sm font-bold border border-white/20">
                      Login
                    </Link>
                    <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-3 bg-techverse-olive text-techverse-green rounded-sm font-bold">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

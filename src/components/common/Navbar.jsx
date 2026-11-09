import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, User, BookOpen, LogOut, ChevronDown, 
  FolderTree, PenTool, Bookmark, FileText, Users, Sparkles,
  HelpCircle, Compass, Layers, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import categoryService from '../../services/categoryService';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Dropdown states
  const [openMegaMenu, setOpenMegaMenu] = useState(null); // 'categories' | 'explore' | 'resources' | 'user'
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fetch categories for mega menu
    categoryService.getAllCategories()
      .then(cats => setCategories(cats || []))
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click or location change
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMegaMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenMegaMenu(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMobileMenuOpen(false);
    setOpenMegaMenu(null);
  };

  const toggleMega = (menu) => {
    setOpenMegaMenu(openMegaMenu === menu ? null : menu);
  };

  return (
    <nav 
      ref={navRef}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-techverse-green/95 backdrop-blur-md shadow-lg py-3.5 text-techverse-eggshell' 
          : 'bg-techverse-eggshell/90 backdrop-blur-sm border-b border-techverse-green/10 py-4 text-techverse-green'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <span className={`text-2xl font-black tracking-tighter ${isScrolled ? 'text-techverse-eggshell' : 'text-techverse-green'}`}>
                TECH<span className="text-techverse-olive">VERSE</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link 
                to="/" 
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  location.pathname === '/' 
                    ? 'text-techverse-olive' 
                    : isScrolled ? 'hover:text-techverse-olive text-techverse-eggshell' : 'hover:text-techverse-olive text-techverse-green'
                }`}
              >
                Home
              </Link>

              {/* Explore Mega Menu Trigger */}
              <div className="relative">
                <button
                  onClick={() => toggleMega('explore')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    openMegaMenu === 'explore' || location.pathname.startsWith('/explore')
                      ? 'text-techverse-olive'
                      : isScrolled ? 'hover:text-techverse-olive text-techverse-eggshell' : 'hover:text-techverse-olive text-techverse-green'
                  }`}
                >
                  <span>Explore Blogs</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${openMegaMenu === 'explore' ? 'rotate-180' : ''}`} />
                </button>

                {openMegaMenu === 'explore' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-techverse-green/10 p-4 text-techverse-green z-50"
                  >
                    <div className="space-y-1">
                      <Link
                        to="/explore"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-techverse-eggshell transition"
                      >
                        <Compass className="text-techverse-olive shrink-0 mt-0.5" size={18} />
                        <div>
                          <div className="font-bold text-sm">All Blogs</div>
                          <div className="text-xs text-techverse-green/60">Browse complete platform archive</div>
                        </div>
                      </Link>

                      <Link
                        to="/explore?sort=trending"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-techverse-eggshell transition"
                      >
                        <Sparkles className="text-techverse-olive shrink-0 mt-0.5" size={18} />
                        <div>
                          <div className="font-bold text-sm">Trending Blogs</div>
                          <div className="text-xs text-techverse-green/60">Most engaged technology pieces</div>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Categories Mega Menu Trigger */}
              <div className="relative">
                <button
                  onClick={() => toggleMega('categories')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    openMegaMenu === 'categories' || location.pathname.startsWith('/category')
                      ? 'text-techverse-olive'
                      : isScrolled ? 'hover:text-techverse-olive text-techverse-eggshell' : 'hover:text-techverse-olive text-techverse-green'
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${openMegaMenu === 'categories' ? 'rotate-180' : ''}`} />
                </button>

                {openMegaMenu === 'categories' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-techverse-green/10 p-5 text-techverse-green z-50"
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-techverse-green/10">
                      <span className="text-xs font-black uppercase tracking-wider text-techverse-green/60">
                        Platform Topics
                      </span>
                      <Link to="/explore" className="text-xs font-bold text-techverse-olive hover:underline">
                        View All →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto pr-1">
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <Link
                            key={cat.categoryId}
                            to={`/category/${cat.categoryId}`}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-techverse-eggshell transition text-sm font-semibold text-techverse-green"
                          >
                            <span className="truncate">{cat.categoryTitle}</span>
                            <span className="text-xs text-techverse-green/50">→</span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-techverse-green/60 py-2">Loading categories...</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Resources Mega Menu */}
              <div className="relative">
                <button
                  onClick={() => toggleMega('resources')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    openMegaMenu === 'resources'
                      ? 'text-techverse-olive'
                      : isScrolled ? 'hover:text-techverse-olive text-techverse-eggshell' : 'hover:text-techverse-olive text-techverse-green'
                  }`}
                >
                  <span>Resources</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${openMegaMenu === 'resources' ? 'rotate-180' : ''}`} />
                </button>

                {openMegaMenu === 'resources' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-techverse-green/10 p-4 text-techverse-green z-50"
                  >
                    <div className="space-y-1">
                      <a
                        href="/#why-techverse"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-techverse-eggshell transition"
                      >
                        <Info className="text-techverse-olive shrink-0 mt-0.5" size={18} />
                        <div>
                          <div className="font-bold text-sm">Why TechVerse?</div>
                          <div className="text-xs text-techverse-green/60">Our philosophy & mission</div>
                        </div>
                      </a>

                      <a
                        href="/#how-it-works"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-techverse-eggshell transition"
                      >
                        <Layers className="text-techverse-olive shrink-0 mt-0.5" size={18} />
                        <div>
                          <div className="font-bold text-sm">How It Works</div>
                          <div className="text-xs text-techverse-green/60">Explore, write, and share</div>
                        </div>
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/explore" 
              className={`p-2 rounded-full transition ${isScrolled ? 'text-techverse-eggshell hover:bg-white/10' : 'text-techverse-green hover:bg-techverse-green/5'}`}
              title="Search blogs"
            >
              <Search size={18} />
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard/articles/new"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-techverse-olive text-techverse-green hover:opacity-95 transition shadow-sm"
                >
                  <PenTool size={13} />
                  <span>Write Post</span>
                </Link>

                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 text-techverse-eggshell hover:bg-white/30 transition"
                  >
                    Admin
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleMega('user')}
                    className="flex items-center gap-2 p-1 rounded-full border border-techverse-olive/50 hover:border-techverse-olive transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-techverse-green text-techverse-eggshell flex items-center justify-center font-bold text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <ChevronDown size={14} className={isScrolled ? 'text-techverse-eggshell' : 'text-techverse-green'} />
                  </button>

                  {openMegaMenu === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-techverse-green/10 p-3 text-techverse-green z-50"
                    >
                      <div className="px-3 py-2 border-b border-techverse-green/5 mb-1">
                        <div className="font-bold text-sm truncate">{user?.name}</div>
                        <div className="text-xs text-techverse-green/60 truncate">{user?.email}</div>
                      </div>

                      <div className="space-y-0.5">
                        <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-techverse-eggshell transition">
                          <BookOpen size={15} className="text-techverse-olive" />
                          <span>Dashboard Overview</span>
                        </Link>
                        <Link to="/dashboard/articles" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-techverse-eggshell transition">
                          <Layers size={15} className="text-techverse-olive" />
                          <span>My Posts</span>
                        </Link>
                        <Link to="/dashboard/drafts" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-techverse-eggshell transition">
                          <FileText size={15} className="text-techverse-olive" />
                          <span>Drafts</span>
                        </Link>
                        <Link to="/dashboard/bookmarks" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-techverse-eggshell transition">
                          <Bookmark size={15} className="text-techverse-olive" />
                          <span>Saved Bookmarks</span>
                        </Link>
                        <Link to="/dashboard/following" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-techverse-eggshell transition">
                          <Users size={15} className="text-techverse-olive" />
                          <span>Community & Following</span>
                        </Link>
                        <Link to="/dashboard/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-techverse-eggshell transition">
                          <User size={15} className="text-techverse-olive" />
                          <span>Profile Settings</span>
                        </Link>
                        {isAdmin() && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-techverse-olive hover:bg-techverse-eggshell transition">
                            <Sparkles size={15} />
                            <span>Admin Control Panel</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-2 mt-2 border-t border-techverse-green/5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/login"
                  className={`text-sm font-bold transition ${isScrolled ? 'text-techverse-eggshell hover:text-techverse-olive' : 'text-techverse-green hover:text-techverse-olive'}`}
                >
                  Log In
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90 transition shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 focus:outline-none ${isScrolled ? 'text-techverse-eggshell' : 'text-techverse-green'}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-techverse-green text-techverse-eggshell border-t border-techverse-olive/20 shadow-2xl overflow-hidden"
          >
            <div className="px-5 pt-4 pb-8 space-y-3 flex flex-col">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold py-1.5">
                Home
              </Link>
              <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold py-1.5">
                Explore All Blogs
              </Link>

              {/* Categories Accordion */}
              <div className="py-2 border-y border-techverse-olive/20">
                <div className="text-xs font-bold uppercase tracking-wider text-techverse-olive mb-2">
                  Popular Categories
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map(cat => (
                    <Link
                      key={cat.categoryId}
                      to={`/category/${cat.categoryId}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs py-1 text-techverse-eggshell/80 hover:text-techverse-olive"
                    >
                      • {cat.categoryTitle}
                    </Link>
                  ))}
                </div>
              </div>

              {user ? (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-techverse-olive">
                    My Account ({user.name})
                  </div>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">
                    Dashboard Overview
                  </Link>
                  <Link to="/dashboard/articles" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">
                    My Posts
                  </Link>
                  <Link to="/dashboard/drafts" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">
                    Drafts
                  </Link>
                  <Link to="/dashboard/bookmarks" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">
                    Saved Bookmarks
                  </Link>
                  <Link to="/dashboard/following" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">
                    Community & Following
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-techverse-olive py-1">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-sm text-red-300 font-bold py-2 text-left">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-4 border-t border-techverse-olive/20">
                  <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-lg border border-techverse-olive text-techverse-eggshell font-bold text-sm">
                    Log In
                  </Link>
                  <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-lg bg-techverse-olive text-techverse-green font-bold text-sm">
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

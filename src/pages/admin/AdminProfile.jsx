import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Globe,
  Shield, Key, Save, BookOpen, CheckCircle2, AlertCircle, RefreshCw,
  Users, FolderTree, MessageSquare, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import postService from '../../services/postService';
import commentService from '../../services/commentService';
import categoryService from '../../services/categoryService';

const GithubIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const AdminProfile = () => {
  const { user, updateUserContext } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'social', 'security', 'system'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    about: '',
    mobileNumber: '',
    address: '',
    githubUrl: '',
    linkedinUrl: '',
    instaUrl: '',
    password: '',
    confirmPassword: ''
  });

  // System Stats
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCategories: 0,
    totalComments: 0
  });

  const userId = user?.id || user?.userId;

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch latest user profile details
        const data = await userService.getUserById(userId);

        setFormData(prev => ({
          ...prev,
          name: data.name || user?.name || '',
          email: data.email || user?.email || '',
          about: data.about || '',
          mobileNumber: data.mobileNumber || '',
          address: data.address || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          instaUrl: data.instaUrl || '',
          password: '',
          confirmPassword: ''
        }));

        // Fetch platform system statistics
        try {
          const [users, posts, categories, comments] = await Promise.all([
            userService.getAllUsers().catch(() => []),
            postService.getAllPosts({ pageSize: 1 }).catch(() => ({ totalElements: 0 })),
            categoryService.getAllCategories().catch(() => []),
            commentService.getAllComments().catch(() => [])
          ]);

          setSystemStats({
            totalUsers: users?.length || 0,
            totalPosts: posts?.totalElements || (Array.isArray(posts) ? posts.length : 0),
            totalCategories: categories?.length || 0,
            totalComments: comments?.length || 0
          });
        } catch (statErr) {
          console.error('Error fetching system stats:', statErr);
        }

      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
        toast.error('Could not load latest admin profile details.');
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            about: user.about || '',
            mobileNumber: user.mobileNumber || '',
            address: user.address || ''
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Admin User ID not found');
      return;
    }

    if (activeTab === 'security' && formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 4) {
        toast.error('Password must be at least 4 characters long');
        return;
      }
    }

    try {
      setSaving(true);

      const updatePayload = {
        name: formData.name,
        email: formData.email,
        about: formData.about,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        instaUrl: formData.instaUrl
      };

      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const updatedUser = await userService.updateUser(userId, updatePayload);

      // Update global context so Admin sidebar and app headers update instantly
      updateUserContext(updatedUser);

      toast.success('Admin Profile updated successfully!');

      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      console.error('Error updating admin profile:', error);
      const errorMsg = error.response?.data?.message
        || (typeof error.response?.data === 'string' ? error.response.data : null)
        || (error.response?.data && typeof error.response.data === 'object' ? Object.values(error.response.data)[0] : null)
        || 'Failed to update admin profile.';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4 text-techverse-green">
          <RefreshCw className="animate-spin text-techverse-olive" size={36} />
          <p className="font-semibold text-lg">Loading Admin Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">

      {/* Header Banner & Admin Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-2xl shadow-md border border-techverse-green/10 overflow-hidden"
      >
        {/* Top Dark Banner */}
        <div className="h-36 bg-gradient-to-r from-techverse-green via-techverse-green/95 to-techverse-green/90 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-4 right-6 flex items-center space-x-2 bg-techverse-olive/20 text-techverse-olive px-3 py-1 rounded-full text-xs font-bold uppercase border border-techverse-olive/30">
            <ShieldCheck size={14} />
            <span>Administrator Privileges</span>
          </div>
        </div>

        {/* Profile Header Content */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-white bg-techverse-green text-techverse-olive flex items-center justify-center font-black text-4xl shadow-xl">
                {formData.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-techverse-olive border-2 border-white flex items-center justify-center" title="Root Administrator">
                <ShieldCheck size={16} className="text-techverse-green" />
              </div>
            </div>

            {/* Info */}
            <div className="pb-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-techverse-olive">{formData.name || 'Admin User'}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase bg-techverse-green text-techverse-eggshell border border-techverse-green">
                  ADMIN
                </span>
              </div>
              <p className="text-sm text-techverse-green/70 flex items-center justify-center sm:justify-start mt-1">
                <Mail size={14} className="mr-1.5 opacity-70" />
                {formData.email || 'admin@techverse.com'}
              </p>
              {formData.address && (
                <p className="text-xs text-techverse-green/60 flex items-center justify-center sm:justify-start mt-1">
                  <MapPin size={12} className="mr-1 opacity-70" />
                  {formData.address}
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center justify-center space-x-6 bg-techverse-eggshell/60 border border-techverse-green/10 px-5 py-3 rounded-xl self-center sm:self-end">
            <div className="text-center">
              <span className="block text-xl font-black text-techverse-green">{systemStats.totalUsers}</span>
              <span className="text-xs text-techverse-green/70 font-semibold">Users</span>
            </div>
            <div className="w-px h-8 bg-techverse-green/15"></div>
            <div className="text-center">
              <span className="block text-xl font-black text-techverse-green">{systemStats.totalPosts}</span>
              <span className="text-xs text-techverse-green/70 font-semibold">Posts</span>
            </div>
            <div className="w-px h-8 bg-techverse-green/15"></div>
            <div className="text-center">
              <span className="block text-xl font-black text-techverse-green">Active</span>
              <span className="text-xs text-techverse-green/70 font-semibold">System</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-t border-techverse-green/10 px-6 overflow-x-auto scrollbar-hide bg-gray-50/50">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center space-x-2 py-4 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'personal'
              ? 'border-techverse-green text-techverse-green'
              : 'border-transparent text-techverse-green/60 hover:text-techverse-green'
              }`}
          >
            <User size={16} />
            <span>Personal Information</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center space-x-2 py-4 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'social'
              ? 'border-techverse-green text-techverse-green'
              : 'border-transparent text-techverse-green/60 hover:text-techverse-green'
              }`}
          >
            <Globe size={16} />
            <span>Social Profiles</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 py-4 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'security'
              ? 'border-techverse-green text-techverse-green'
              : 'border-transparent text-techverse-green/60 hover:text-techverse-green'
              }`}
          >
            <Shield size={16} />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center space-x-2 py-4 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'system'
              ? 'border-techverse-green text-techverse-green'
              : 'border-transparent text-techverse-green/60 hover:text-techverse-green'
              }`}
          >
            <ShieldCheck size={16} />
            <span>System Overview & Status</span>
          </button>
        </div>
      </motion.div>

      {/* Main Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-techverse-green/10 p-6 sm:p-8"
      >
        {activeTab !== 'system' ? (
          <form onSubmit={handleSaveProfile} className="space-y-6">

            {/* PERSONAL INFORMATION TAB */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-techverse-green mb-1">Admin Personal Details</h3>
                  <p className="text-xs text-techverse-green/70">Update your administrator account identity and contact information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-techverse-green/50" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-techverse-green/50" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@domain.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-techverse-green/50" />
                      <input
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Location / Address */}
                  <div>
                    <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2">
                      Location / Address
                    </label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-techverse-green/50" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="City, Country"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* About / Bio */}
                <div>
                  <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2">
                    Admin Bio / Notes
                  </label>
                  <textarea
                    name="about"
                    rows={4}
                    value={formData.about}
                    onChange={handleChange}
                    placeholder="Provide a brief summary of your administrative role or credentials..."
                    className="w-full p-4 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                  ></textarea>
                </div>
              </div>
            )}

            {/* SOCIAL PROFILES TAB */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-techverse-green mb-1">Social & Public Profiles</h3>
                  <p className="text-xs text-techverse-green/70">Connect your public developer & professional links.</p>
                </div>

                <div className="space-y-5 max-w-2xl">
                  {/* GitHub */}
                  <div>
                    <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2 flex items-center">
                      <GithubIcon size={16} className="mr-2 text-techverse-green" /> GitHub URL
                    </label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/admin"
                      className="w-full px-4 py-3 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2 flex items-center">
                      <LinkedinIcon size={16} className="mr-2 text-blue-600" /> LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/admin"
                      className="w-full px-4 py-3 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2 flex items-center">
                      <InstagramIcon size={16} className="mr-2 text-pink-600" /> Instagram Profile
                    </label>
                    <input
                      type="url"
                      name="instaUrl"
                      value={formData.instaUrl}
                      onChange={handleChange}
                      placeholder="https://instagram.com/admin"
                      className="w-full px-4 py-3 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-techverse-green mb-1">Admin Account Security</h3>
                  <p className="text-xs text-techverse-green/70">Update your administrator password to protect platform access.</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-900 text-xs font-medium max-w-2xl">
                  <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    Leave these password fields blank if you do not wish to modify your current administrator password.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2">
                      New Admin Password
                    </label>
                    <div className="relative">
                      <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-techverse-green/50" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-techverse-green uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-techverse-green/50" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-techverse-green/20 focus:border-techverse-green focus:ring-2 focus:ring-techverse-green/20 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button Footer */}
            <div className="pt-6 border-t border-techverse-green/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90 px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Saving Admin Profile...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* SYSTEM OVERVIEW & STATUS TAB */
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-techverse-green mb-1">System Health & Admin Scope</h3>
              <p className="text-xs text-techverse-green/70">Overview of platform components managed by your administrator account.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-techverse-eggshell/40 border border-techverse-green/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-techverse-green/60 uppercase">Registered Users</p>
                  <p className="text-2xl font-black text-techverse-green mt-1">{systemStats.totalUsers}</p>
                </div>
                <div className="p-3 bg-techverse-olive/20 rounded-xl text-techverse-green">
                  <Users size={24} />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-techverse-eggshell/40 border border-techverse-green/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-techverse-green/60 uppercase">Total Articles</p>
                  <p className="text-2xl font-black text-techverse-green mt-1">{systemStats.totalPosts}</p>
                </div>
                <div className="p-3 bg-techverse-olive/20 rounded-xl text-techverse-green">
                  <BookOpen size={24} />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-techverse-eggshell/40 border border-techverse-green/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-techverse-green/60 uppercase">Categories</p>
                  <p className="text-2xl font-black text-techverse-green mt-1">{systemStats.totalCategories}</p>
                </div>
                <div className="p-3 bg-techverse-olive/20 rounded-xl text-techverse-green">
                  <FolderTree size={24} />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-techverse-eggshell/40 border border-techverse-green/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-techverse-green/60 uppercase">Comments</p>
                  <p className="text-2xl font-black text-techverse-green mt-1">{systemStats.totalComments}</p>
                </div>
                <div className="p-3 bg-techverse-olive/20 rounded-xl text-techverse-green">
                  <MessageSquare size={24} />
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 rounded-xl bg-techverse-green text-techverse-eggshell border border-techverse-olive/30 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-techverse-olive text-techverse-green flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-black text-base text-techverse-eggshell">Full Administrative Access Granted</h4>
                  <p className="text-xs text-techverse-olive">Root level control across users, posts, categories, media, and comments.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="flex items-center space-x-2 bg-techverse-green/80 p-2.5 rounded-lg border border-techverse-olive/20">
                  <CheckCircle2 size={16} className="text-techverse-olive" />
                  <span>User Management & Roles</span>
                </div>
                <div className="flex items-center space-x-2 bg-techverse-green/80 p-2.5 rounded-lg border border-techverse-olive/20">
                  <CheckCircle2 size={16} className="text-techverse-olive" />
                  <span>Global Media Control</span>
                </div>
                <div className="flex items-center space-x-2 bg-techverse-green/80 p-2.5 rounded-lg border border-techverse-olive/20">
                  <CheckCircle2 size={16} className="text-techverse-olive" />
                  <span>Content Moderation</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </motion.div>

    </div>
  );
};

export default AdminProfile;

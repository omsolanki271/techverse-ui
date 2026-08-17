import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, MessageSquare, FolderTree } from 'lucide-react';
import userService from '../../services/userService';
import postService from '../../services/postService';
import commentService from '../../services/commentService';
import categoryService from '../../services/categoryService';

const AdminOverview = () => {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', icon: Users },
    { label: 'Total Posts', value: '0', icon: BookOpen },
    { label: 'Total Categories', value: '0', icon: FolderTree },
    { label: 'Total Comments', value: '0', icon: MessageSquare },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, posts, categories, comments] = await Promise.all([
          userService.getAllUsers(),
          postService.getAllPosts({ pageSize: 1 }), // Just need total elements
          categoryService.getAllCategories(),
          commentService.getAllComments()
        ]);
        
        setStats([
          { label: 'Total Users', value: (users?.length || 0).toString(), icon: Users },
          { label: 'Total Posts', value: (posts?.totalElements || 0).toString(), icon: BookOpen },
          { label: 'Total Categories', value: (categories?.length || 0).toString(), icon: FolderTree },
          { label: 'Total Comments', value: (comments?.length || 0).toString(), icon: MessageSquare },
        ]);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-techverse-olive"></div></div>;
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-techverse-green">System Overview</h1>
        <p className="text-techverse-green/70">High-level statistics for TechVerse platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-techverse-green/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-60 text-techverse-green">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-2 text-techverse-green">{stat.value}</h3>
              </div>
              <div className="p-3 bg-techverse-olive/20 rounded-lg">
                <stat.icon size={24} className="text-techverse-olive" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminOverview;

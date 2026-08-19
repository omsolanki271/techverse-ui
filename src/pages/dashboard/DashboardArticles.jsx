import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Eye, Trash2, PenTool, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import postService from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const DashboardArticles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const userId = user.userId || user.id;
        // The API returns paginated response, using a large size or handling pagination
        const res = await postService.getPostsByUser(userId, { pageSize: 50, sortBy: 'addedDate', sortDirection: 'desc' });
        setArticles(res.content || []);
      } catch (error) {
        toast.error('Failed to load your posts.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyPosts();
  }, [user, toast]);

  const handleDelete = async (postId) => {
    if (!(await confirm('Are you sure you want to delete this post? This cannot be undone.'))) return;
    try {
      await postService.deletePost(postId);
      setArticles(articles.filter(a => a.postId !== postId));
      toast.success('Post deleted successfully');
    } catch (err) {
      toast.error('Failed to delete post.');
    }
  };

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
    }
    return postService.getPostImage(postId);
  };

  return (
    <div className="h-full flex flex-col">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-techverse-green tracking-tight">My Posts</h1>
          <p className="text-base opacity-70 mt-1 text-techverse-green font-medium">Manage and organize your publications.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={16} className="text-techverse-green/50" />
            </div>
            <input 
              type="text" 
              placeholder="Search library..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-techverse-green/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-techverse-olive shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white border border-techverse-green/10 rounded-full p-1 shadow-sm hidden sm:flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-techverse-olive text-techverse-green' : 'text-techverse-green/50 hover:text-techverse-green'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-techverse-olive text-techverse-green' : 'text-techverse-green/50 hover:text-techverse-green'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Board View */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-techverse-olive"></div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
        >
          {/* Create New Card */}
          <motion.div variants={itemVariants}>
            <Link to="/dashboard/articles/new" className="h-full min-h-[220px] flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-techverse-olive/50 rounded-3xl text-techverse-olive hover:bg-techverse-olive/10 transition-colors group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-techverse-olive/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PenTool size={28} />
              </div>
              <span className="font-bold text-lg">Start a New Post</span>
            </Link>
          </motion.div>

          {/* Article Cards */}
          {filteredArticles.map(article => (
            <motion.div 
              key={article.postId} 
              variants={itemVariants}
              className={`group bg-white rounded-3xl p-6 border border-techverse-green/10 shadow-sm hover:shadow-md transition-all flex ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'flex-col justify-between min-h-[220px]'}`}
            >
              <div className={`flex-1 ${viewMode === 'list' ? 'flex items-center gap-6' : 'mb-6'}`}>
                <div className={`${viewMode === 'list' ? 'w-32 h-20' : 'w-full h-32'} rounded-2xl overflow-hidden bg-techverse-eggshell mb-4 ${viewMode === 'list' ? 'mb-0 flex-shrink-0' : ''}`}>
                  <img src={getImageUrl(article.imageName, article.postId)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-techverse-olive/20 text-techverse-green">
                      {article.category?.categoryTitle || 'Uncategorized'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-techverse-green leading-tight mb-2 line-clamp-2 group-hover:text-techverse-olive transition-colors">
                    {article.title}
                  </h3>
                </div>
              </div>

              <div className={`flex items-center justify-between pt-4 border-t border-techverse-green/10 ${viewMode === 'list' ? 'border-none pt-0 pl-6 border-l w-48' : ''}`}>
                <div className="text-xs font-medium text-techverse-green/60">
                  {new Date(article.addedDate).toLocaleDateString()}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/article/${article.postId}`} className="p-2 bg-techverse-eggshell rounded-full text-techverse-green hover:bg-techverse-green hover:text-techverse-eggshell transition-colors" title="View">
                    <Eye size={16} />
                  </Link>
                  <Link to={`/dashboard/articles/${article.postId}/edit`} className="p-2 bg-techverse-olive rounded-full text-techverse-green hover:bg-opacity-80 transition-colors" title="Edit">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => handleDelete(article.postId)} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default DashboardArticles;

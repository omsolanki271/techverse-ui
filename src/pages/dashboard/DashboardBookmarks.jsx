import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Search, Trash2, ArrowUpRight, Calendar, Heart, Share2, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import postService from '../../services/postService';
import { useToast } from '../../context/ToastContext';

const DashboardBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await postService.getMyBookmarks({ pageSize: 50 });
      setBookmarks(res.content || []);
    } catch (err) {
      toast.error('Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (postId) => {
    try {
      await postService.toggleBookmark(postId);
      setBookmarks(bookmarks.filter(b => b.postId !== postId));
      toast.success('Removed from bookmarks');
    } catch (err) {
      toast.error('Failed to remove bookmark.');
    }
  };

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600';
    }
    return postService.getPostImage(postId);
  };

  const filtered = bookmarks.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-10 h-10 animate-spin text-techverse-olive mb-3" />
        <p className="text-sm font-medium text-techverse-green/70">Loading saved bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-techverse-green tracking-tight">Saved Bookmarks</h1>
          <p className="text-sm text-techverse-green/70 mt-1">
            Articles and stories you have bookmarked for quick reading.
          </p>
        </div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-techverse-green/15 text-techverse-green hover:bg-techverse-eggshell transition shadow-sm w-fit"
        >
          <BookOpen size={16} />
          <span>Explore More Stories</span>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-techverse-green/40" />
        <input
          type="text"
          placeholder="Filter bookmarks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-techverse-green/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-techverse-olive text-techverse-green shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-techverse-green/10 p-8 shadow-sm">
          <Bookmark size={48} className="mx-auto text-techverse-green/30 mb-3" />
          <h3 className="text-lg font-bold text-techverse-green mb-1">No bookmarked articles</h3>
          <p className="text-xs text-techverse-green/60 max-w-sm mx-auto mb-6">
            Save articles while exploring the platform to read or reference them anytime from your dashboard.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90 transition shadow-sm"
          >
            <span>Browse Articles</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <motion.div
              key={post.postId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-techverse-green/10 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
            >
              <div>
                <Link to={`/article/${post.postId}`} className="block relative h-44 overflow-hidden bg-techverse-green/10">
                  <img
                    src={getImageUrl(post.imageName, post.postId)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {post.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-sm">
                      {post.category.categoryTitle}
                    </span>
                  )}
                </Link>

                <div className="p-5">
                  <Link to={`/article/${post.postId}`}>
                    <h3 className="text-lg font-bold text-techverse-green line-clamp-2 mb-2 group-hover:text-techverse-olive transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-techverse-green/70 line-clamp-3 mb-4 leading-relaxed">
                    {(post.content || '').replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-techverse-green/60 pt-2 border-t border-techverse-green/5">
                    <span>By {post.user?.name || 'Author'}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart size={12} className="text-red-500 fill-red-500" />
                        {post.likeCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 size={12} />
                        {post.shareCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-techverse-eggshell/40 border-t border-techverse-green/5 flex items-center justify-between">
                <Link
                  to={`/article/${post.postId}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-techverse-green hover:text-techverse-olive transition"
                >
                  <span>Read Article</span>
                  <ArrowUpRight size={13} />
                </Link>

                <button
                  onClick={() => handleRemoveBookmark(post.postId)}
                  className="p-1.5 text-techverse-green/50 hover:text-red-500 transition rounded-md"
                  title="Remove from Bookmarks"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardBookmarks;


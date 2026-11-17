import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserMinus, ArrowUpRight, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DashboardFollowing = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = user?.userId || user?.id;
      const followingData = await userService.getFollowing(userId);
      setFollowingList(Array.isArray(followingData) ? followingData : []);
    } catch (err) {
      toast.error('Failed to load community connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleUnfollow = async (authorId) => {
    try {
      await userService.toggleFollow(authorId);
      setFollowingList(followingList.filter(u => u.id !== authorId));
      toast.success('Unfollowed author');
    } catch {
      toast.error('Failed to unfollow author');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-10 h-10 animate-spin text-techverse-olive mb-3" />
        <p className="text-sm font-medium text-techverse-green/70">Loading followed authors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-techverse-green tracking-tight">Community & Following</h1>
          <p className="text-sm text-techverse-green/70 mt-1">
            Manage the authors you follow.
          </p>
        </div>
      </div>

      {followingList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-techverse-green/10 p-8 shadow-sm">
          <Users size={48} className="mx-auto text-techverse-green/30 mb-3" />
          <h3 className="text-lg font-bold text-techverse-green mb-1">
            Not following any authors yet
          </h3>
          <p className="text-xs text-techverse-green/60 max-w-sm mx-auto mb-6">
            Explore articles and visit author profiles to follow their work.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90 transition shadow-sm"
          >
            <BookOpen size={14} />
            <span>Discover Authors</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {followingList.map((author) => (
            <motion.div
              key={author.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-2xl border border-techverse-green/10 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-techverse-olive text-techverse-green flex items-center justify-center font-black text-lg shadow-sm">
                    {(author.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <Link
                      to={`/author/${author.id}`}
                      className="font-bold text-techverse-green hover:text-techverse-olive transition-colors block truncate"
                    >
                      {author.name}
                    </Link>
                    <span className="text-xs text-techverse-green/60 block truncate">
                      {author.email}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-techverse-green/70 line-clamp-2 mb-4 leading-relaxed">
                  {author.about || 'Author and contributor on TechVerse.'}
                </p>
              </div>

              <div className="pt-3 border-t border-techverse-green/5 flex items-center justify-between">
                <Link
                  to={`/author/${author.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-techverse-green hover:underline"
                >
                  <span>View Profile</span>
                  <ArrowUpRight size={13} />
                </Link>

                <button
                  onClick={() => handleUnfollow(author.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-techverse-eggshell text-techverse-green hover:bg-red-50 hover:text-red-600 transition"
                >
                  <UserMinus size={13} />
                  <span>Unfollow</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardFollowing;


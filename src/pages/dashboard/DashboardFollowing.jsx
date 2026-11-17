import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, UserMinus, ArrowUpRight, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DashboardFollowing = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('following'); // 'following' | 'subscriptions'
  const [followingList, setFollowingList] = useState([]);
  const [subList, setSubList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = user?.userId || user?.id;
      const [followingData, subData] = await Promise.all([
        userService.getFollowing(userId).catch(() => []),
        userService.getMySubscriptions().catch(() => [])
      ]);
      setFollowingList(Array.isArray(followingData) ? followingData : []);
      setSubList(Array.isArray(subData) ? subData : []);
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

  const handleUnsubscribe = async (authorId) => {
    try {
      await userService.toggleSubscribe(authorId);
      setSubList(subList.filter(u => u.id !== authorId));
      toast.success('Unsubscribed from author updates');
    } catch {
      toast.error('Failed to unsubscribe');
    }
  };

  const list = activeTab === 'following' ? followingList : subList;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-10 h-10 animate-spin text-techverse-olive mb-3" />
        <p className="text-sm font-medium text-techverse-green/70">Loading authors and subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-techverse-green tracking-tight">Community & Following</h1>
          <p className="text-sm text-techverse-green/70 mt-1">
            Manage authors you follow and newsletters you subscribe to.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-techverse-green/10 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('following')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'following'
              ? 'text-techverse-green border-b-2 border-techverse-green'
              : 'text-techverse-green/50 hover:text-techverse-green'
          }`}
        >
          <Users size={16} />
          <span>Following ({followingList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'subscriptions'
              ? 'text-techverse-green border-b-2 border-techverse-green'
              : 'text-techverse-green/50 hover:text-techverse-green'
          }`}
        >
          <Bell size={16} />
          <span>Subscriptions ({subList.length})</span>
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-techverse-green/10 p-8 shadow-sm">
          <Users size={48} className="mx-auto text-techverse-green/30 mb-3" />
          <h3 className="text-lg font-bold text-techverse-green mb-1">
            {activeTab === 'following' ? 'Not following any authors yet' : 'No author subscriptions yet'}
          </h3>
          <p className="text-xs text-techverse-green/60 max-w-sm mx-auto mb-6">
            Explore articles and visit author profiles to follow their work and subscribe to their publication updates.
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
          {list.map((author) => (
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

                {activeTab === 'following' ? (
                  <button
                    onClick={() => handleUnfollow(author.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-techverse-eggshell text-techverse-green hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <UserMinus size={13} />
                    <span>Unfollow</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnsubscribe(author.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-techverse-eggshell text-techverse-green hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <span>Unsubscribe</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardFollowing;


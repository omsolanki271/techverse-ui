import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, MapPin, Globe, BookOpen, Clock,
  ArrowLeft, RefreshCw, CheckCircle2, ArrowRight,
  UserPlus, UserCheck, Bell, BellOff, Heart, Bookmark, Share2, Eye
} from 'lucide-react';
import userService from '../../services/userService';
import postService from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

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

const AuthorProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Social & Engagement state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);

        const [userData, postsData, followStatus, subStatus] = await Promise.allSettled([
          userService.getUserById(userId),
          postService.getPostsByUser(userId, { pageSize: 50, sortBy: 'addedDate', sortDirection: 'desc' }),
          userService.getFollowStatus(userId),
          user ? userService.getSubscribeStatus(userId) : Promise.resolve({ subscribed: false })
        ]);

        if (userData.status === 'fulfilled') {
          setAuthor(userData.value);
        }

        if (postsData.status === 'fulfilled') {
          const fetchedPosts = postsData.value?.content || (Array.isArray(postsData.value) ? postsData.value : []);
          setPosts(fetchedPosts);

          if (userData.status !== 'fulfilled' && fetchedPosts.length > 0 && fetchedPosts[0].user) {
            setAuthor(fetchedPosts[0].user);
          }
        }

        if (followStatus.status === 'fulfilled') {
          setIsFollowing(followStatus.value.following || false);
          setFollowerCount(followStatus.value.followerCount || 0);
          setFollowingCount(followStatus.value.followingCount || 0);
        }

        if (subStatus.status === 'fulfilled') {
          setIsSubscribed(subStatus.value.subscribed || false);
        }
      } catch (error) {
        console.error('Error loading author profile page:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAuthorData();
    }
  }, [userId, user]);

  const requireAuth = (actionName) => {
    if (!user) {
      toast.error(`Please log in to ${actionName}.`);
      return false;
    }
    return true;
  };

  const handleFollowToggle = async () => {
    if (!requireAuth('follow this author')) return;
    setActionLoading(true);
    try {
      const res = await userService.toggleFollow(userId);
      setIsFollowing(res.following);
      setFollowerCount(res.followerCount);
      setFollowingCount(res.followingCount);
      toast.success(res.following ? `Following ${author?.name}` : `Unfollowed ${author?.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update follow status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscribeToggle = async () => {
    if (!requireAuth('subscribe to this author')) return;
    setActionLoading(true);
    try {
      const res = await userService.toggleSubscribe(userId);
      setIsSubscribed(res.subscribed);
      toast.success(res.subscribed ? `Subscribed to ${author?.name}'s publications!` : `Unsubscribed from ${author?.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSharePost = async (postId) => {
    const postUrl = `${window.location.origin}/article/${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success('Article link copied to clipboard!');
      await postService.incrementShare(postId);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
    }
    return postService.getPostImage(postId);
  };

  const isOwner = user && author && (user.id === author.id || user.userId === author.id || user.email === author.email);

  if (loading) {
    return (
      <div className="pt-32 pb-16 min-h-screen flex items-center justify-center bg-techverse-eggshell">
        <div className="flex flex-col items-center space-y-4 text-techverse-green">
          <RefreshCw className="animate-spin text-techverse-olive" size={36} />
          <p className="font-semibold text-lg">Loading Author Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-techverse-eggshell min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Back Link */}
        <div>
          <Link to="/" className="inline-flex items-center text-sm font-bold text-techverse-green hover:text-techverse-olive transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Home
          </Link>
        </div>

        {/* Author Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-2xl shadow-md border border-techverse-green/10 overflow-hidden"
        >
          {/* Header Backdrop */}
          <div className="h-44 bg-gradient-to-r from-techverse-green via-techverse-green/90 to-techverse-olive/80 relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>

          {/* Profile Header Content */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16">
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              {/* Avatar Circle */}
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-techverse-green text-techverse-eggshell flex items-center justify-center font-black text-4xl shadow-xl">
                  {author?.name?.charAt(0)?.toUpperCase() || author?.username?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-techverse-olive border-2 border-white flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-techverse-green" />
                </div>
              </div>

              {/* Author Info */}
              <div className="pb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-3xl font-black text-techverse-green">{author?.name || author?.username || `Author #${userId}`}</h1>
                </div>

                {author?.about && (
                  <p className="text-sm text-techverse-green/80 mt-2 max-w-xl line-clamp-2 leading-relaxed">
                    {author.about}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-techverse-green/70">
                  {author?.email && (
                    <span className="flex items-center">
                      <Mail size={14} className="mr-1.5 opacity-70" />
                      {author.email}
                    </span>
                  )}
                  {author?.address && (
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1.5 opacity-70" />
                      {author.address}
                    </span>
                  )}
                </div>

                {/* Social Profiles */}
                <div className="flex items-center justify-center sm:justify-start space-x-3 mt-4">
                  {author?.githubUrl && (
                    <a href={author.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-techverse-green/5 text-techverse-green hover:bg-techverse-olive hover:text-techverse-green transition-colors" title="GitHub">
                      <GithubIcon size={18} />
                    </a>
                  )}
                  {author?.linkedinUrl && (
                    <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="LinkedIn">
                      <LinkedinIcon size={18} />
                    </a>
                  )}
                  {author?.instaUrl && (
                    <a href={author.instaUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white transition-colors" title="Instagram">
                      <InstagramIcon size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Author Stat Pill & Action Buttons */}
            <div className="flex flex-col sm:items-end gap-3 self-center sm:self-end">
              <div className="flex items-center justify-center space-x-6 bg-techverse-eggshell/60 border border-techverse-green/10 px-6 py-3 rounded-xl shadow-sm">
                <div className="text-center">
                  <span className="block text-xl font-black text-techverse-green">{posts.length}</span>
                  <span className="text-[10px] text-techverse-green/70 font-bold uppercase">Articles</span>
                </div>
                <div className="w-px h-7 bg-techverse-green/10"></div>
                <div className="text-center">
                  <span className="block text-xl font-black text-techverse-green">{followerCount}</span>
                  <span className="text-[10px] text-techverse-green/70 font-bold uppercase">Followers</span>
                </div>
                <div className="w-px h-7 bg-techverse-green/10"></div>
                <div className="text-center">
                  <span className="block text-xl font-black text-techverse-green">{followingCount}</span>
                  <span className="text-[10px] text-techverse-green/70 font-bold uppercase">Following</span>
                </div>
              </div>

              {!isOwner && (
                <div className="flex items-center gap-2 justify-center sm:justify-end w-full">
                  <button
                    onClick={handleFollowToggle}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                      isFollowing
                        ? 'bg-techverse-eggshell text-techverse-green border border-techverse-green/20 hover:bg-red-50 hover:text-red-600'
                        : 'bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90'
                    }`}
                  >
                    {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    <span>{isFollowing ? 'Following' : 'Follow Author'}</span>
                  </button>

                  <button
                    onClick={handleSubscribeToggle}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm border ${
                      isSubscribed
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : 'bg-white text-techverse-green border-techverse-green/20 hover:bg-techverse-eggshell'
                    }`}
                  >
                    {isSubscribed ? <BellOff size={14} /> : <Bell size={14} />}
                    <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Authored Articles Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-techverse-green/10 pb-4">
            <h2 className="text-2xl font-black text-techverse-green flex items-center">
              <BookOpen size={24} className="mr-3 text-techverse-olive" />
              Articles Authored by {author?.name?.split(' ')[0] || 'Author'}
            </h2>
            <span className="text-xs font-bold text-techverse-green/60 uppercase tracking-wider">
              {posts.length} {posts.length === 1 ? 'Published Story' : 'Published Stories'}
            </span>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((article) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={article.postId || article.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-techverse-green/10 overflow-hidden flex flex-col justify-between transition-all duration-300"
                >
                  <div>
                    <Link to={`/article/${article.postId || article.id}`} className="block overflow-hidden h-52 bg-techverse-green relative">
                      <img
                        src={getImageUrl(article.imageName, article.postId || article.id)}
                        alt={article.title || article.postTitle}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                      />
                      {article.category && (
                        <span className="absolute top-3 left-3 bg-black/60 text-white backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {article.category.categoryTitle}
                        </span>
                      )}
                    </Link>

                    <div className="p-6">
                      <Link to={`/article/${article.postId || article.id}`}>
                        <h3 className="text-xl font-bold text-techverse-green group-hover:text-techverse-olive transition-colors line-clamp-2 mb-2 leading-snug">
                          {article.title || article.postTitle}
                        </h3>
                      </Link>

                      <p className="text-xs text-techverse-green/70 line-clamp-3 leading-relaxed mb-4">
                        {(article.content || '').replace(/<[^>]*>/g, '').substring(0, 160) + '...'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-techverse-eggshell/40 border-t border-techverse-green/5 flex items-center justify-between text-xs text-techverse-green/60">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart size={13} className="text-red-500 fill-red-500" />
                        {article.likeCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark size={13} />
                        {article.bookmarkCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSharePost(article.postId || article.id)}
                        className="p-1.5 hover:text-techverse-green transition"
                        title="Copy link"
                      >
                        <Share2 size={14} />
                      </button>
                      <Link
                        to={`/article/${article.postId || article.id}`}
                        className="inline-flex items-center gap-1 font-bold text-techverse-olive hover:text-techverse-green transition"
                      >
                        <span>Read</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-techverse-green/10 p-8 shadow-sm">
              <BookOpen size={48} className="mx-auto text-techverse-green/20 mb-3" />
              <h3 className="text-lg font-bold text-techverse-green">No published articles yet</h3>
              <p className="text-xs text-techverse-green/60 mt-1 max-w-sm mx-auto">
                This author hasn't published any public articles yet. Check back soon for new stories!
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default AuthorProfile;

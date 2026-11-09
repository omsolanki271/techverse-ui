import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Eye, Users, Clock, ThumbsUp, MessageSquare, TrendingUp, Layers, PenTool, ArrowUpRight, FileText, Bookmark, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';
import commentService from '../../services/commentService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#133215', '#92B775', '#5a8241', '#a8c691', '#405B36', '#BBD3A5'];

const MetricCard = ({ title, value, icon: Icon, trend, delay, to }) => {
  const content = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={to ? { y: -4 } : {}}
      transition={{ delay, duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-sm border border-techverse-green/10 p-6 flex items-center justify-between transition-all ${
        to ? 'cursor-pointer hover:border-techverse-olive hover:shadow-md group' : ''
      }`}
    >
      <div>
        <p className="text-techverse-green/60 font-medium mb-1 text-xs uppercase tracking-wider">{title}</p>
        <h4 className="text-3xl font-black text-techverse-green">{value}</h4>
        {trend && (
          <div className="flex items-center mt-2 text-xs font-bold text-techverse-olive group-hover:text-techverse-green transition-colors">
            <TrendingUp size={14} className="mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="w-12 h-12 rounded-2xl bg-techverse-eggshell/60 flex items-center justify-center text-techverse-green group-hover:bg-techverse-olive/20 transition-colors">
        <Icon size={24} />
      </div>
    </motion.div>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
};

const Overview = () => {
  const { user, isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalComments: 0,
    totalCategories: 0,
    totalViews: 0,
    totalLikes: 0,
    totalBookmarks: 0,
    followerCount: 0,
    categoryData: [],
    activityData: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        const userId = user?.id || user?.userId;
        const admin = isAdmin();

        const [postsRes, categories, commentsRes, countsRes, followRes] = await Promise.all([
          admin ? postService.getAllPosts({ pageSize: 1000 }) : postService.getPostsByUser(userId, { pageSize: 1000 }),
          categoryService.getAllCategories().catch(() => []),
          admin ? commentService.getAllComments().catch(() => []) : Promise.resolve([]),
          userId ? postService.getUserPostCounts(userId).catch(() => ({ publishedCount: 0, draftCount: 0, totalCount: 0 })) : Promise.resolve({ publishedCount: 0, draftCount: 0, totalCount: 0 }),
          userId ? userService.getFollowStatus(userId).catch(() => ({ followerCount: 0 })) : Promise.resolve({ followerCount: 0 })
        ]);
        
        const posts = postsRes?.content || [];
        const cats = categories || [];
        const comments = commentsRes || [];
        
        // Process Category Data & Totals
        const catCountMap = {};
        let viewsSum = 0;
        let likesSum = 0;
        let bookmarksSum = 0;
        
        posts.forEach(post => {
          viewsSum += (post.views || 0);
          likesSum += (post.likeCount || 0);
          bookmarksSum += (post.bookmarkCount || 0);
          if (post.category) {
            catCountMap[post.category.categoryTitle] = (catCountMap[post.category.categoryTitle] || 0) + 1;
          }
        });
        
        const categoryData = Object.keys(catCountMap).map(key => ({
          name: key,
          value: catCountMap[key]
        })).sort((a, b) => b.value - a.value);

        // Process Activity Data (7-day timeline window)
        const pastDays = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const rawDate = d.toISOString().split('T')[0];
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          pastDays.push({
            name: dateStr,
            rawDate,
            posts: 0,
            views: 0
          });
        }

        posts.forEach(post => {
          if (post.addedDate) {
            const rawIso = new Date(post.addedDate).toISOString().split('T')[0];
            const match = pastDays.find(p => p.rawDate === rawIso);
            if (match) {
              match.posts += 1;
              match.views += (post.views || 0);
            }
          }
        });

        const userPublished = posts.filter(p => !p.status || p.status.toUpperCase() !== 'DRAFT').length;
        const userDrafts = posts.filter(p => p.status && p.status.toUpperCase() === 'DRAFT').length;

        const liveTotalPosts = Math.max(countsRes?.totalCount || 0, posts.length);
        const livePublishedPosts = Math.max(countsRes?.publishedCount || 0, userPublished);
        const liveDraftPosts = Math.max(countsRes?.draftCount || 0, userDrafts);

        setStats({
          totalPosts: liveTotalPosts,
          publishedPosts: livePublishedPosts,
          draftPosts: liveDraftPosts,
          totalComments: comments.length,
          totalCategories: cats.length,
          totalViews: viewsSum,
          totalLikes: likesSum,
          totalBookmarks: bookmarksSum,
          followerCount: followRes?.followerCount || 0,
          categoryData: categoryData.length > 0 ? categoryData : [{ name: 'General', value: posts.length || 0 }],
          activityData: pastDays
        });
        
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-techverse-olive"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-techverse-green tracking-tight">Dashboard Overview</h1>
        <p className="text-techverse-green/70 text-base mt-1">
          {isAdmin() ? 'Track overall platform performance, real-time engagement, and publications.' : 'Real-time performance metrics for your blog posts, drafts, and community followers.'}
        </p>
      </div>

      {/* Top Metrics with direct navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Published Posts" value={stats.publishedPosts} icon={PenTool} trend="Live Posts" delay={0.1} to="/dashboard/articles" />
        <MetricCard title="Saved Drafts" value={stats.draftPosts} icon={FileText} trend="In Progress" delay={0.2} to="/dashboard/drafts" />
        <MetricCard title="Total Views" value={stats.totalViews} icon={Eye} trend="All Time" delay={0.3} to="/dashboard/articles" />
        <MetricCard title="Followers" value={stats.followerCount} icon={Users} trend="Community" delay={0.4} to="/dashboard/following" />
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/dashboard/articles" className="p-4 bg-white rounded-2xl border border-techverse-green/10 hover:border-techverse-olive transition flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-500">
            <Heart size={18} className="fill-red-500" />
          </div>
          <div>
            <span className="text-xs text-techverse-green/60 font-semibold block">Total Likes</span>
            <span className="text-lg font-black text-techverse-green">{stats.totalLikes}</span>
          </div>
        </Link>

        <Link to="/dashboard/bookmarks" className="p-4 bg-white rounded-2xl border border-techverse-green/10 hover:border-techverse-olive transition flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-techverse-olive/20 text-techverse-green">
            <Bookmark size={18} />
          </div>
          <div>
            <span className="text-xs text-techverse-green/60 font-semibold block">Bookmarks</span>
            <span className="text-lg font-black text-techverse-green">{stats.totalBookmarks}</span>
          </div>
        </Link>

        <Link to="/explore" className="p-4 bg-white rounded-2xl border border-techverse-green/10 hover:border-techverse-olive transition flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-xs text-techverse-green/60 font-semibold block">Categories</span>
            <span className="text-lg font-black text-techverse-green">{stats.totalCategories}</span>
          </div>
        </Link>

        <Link to="/dashboard/articles/new" className="p-4 bg-techverse-green text-techverse-eggshell rounded-2xl hover:bg-techverse-green/90 transition flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 text-techverse-olive">
            <PenTool size={18} />
          </div>
          <div>
            <span className="text-xs text-techverse-eggshell/70 font-semibold block">New Post</span>
            <span className="text-sm font-bold text-techverse-eggshell">Write Now →</span>
          </div>
        </Link>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Posting Activity Area Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-techverse-green/10 p-6 lg:col-span-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-techverse-green/5">
            <div>
              <h3 className="text-lg font-bold text-techverse-green">7-Day Publication & View Activity</h3>
              <p className="text-xs text-techverse-green/60 mt-0.5">Timeline of posts and views across the week</p>
            </div>
            <Link to="/dashboard/articles" className="text-xs font-bold text-techverse-olive hover:underline flex items-center gap-1">
              <span>View Posts</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.activityData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#133215" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#133215" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#92B775" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#92B775" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#133215" strokeOpacity={0.08} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#133215', opacity: 0.6, fontSize: 12 }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#133215', opacity: 0.6, fontSize: 12 }} dx={-5} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(19, 50, 21, 0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="views" stroke="#92B775" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="posts" stroke="#133215" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPosts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-6 pt-4 mt-2 border-t border-techverse-green/5 text-xs text-techverse-green/70">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-techverse-green"></span>
              Posts Published
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-techverse-olive"></span>
              Post Views
            </span>
          </div>
        </motion.div>

        {/* Categories Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-techverse-green/10 p-6 lg:col-span-1 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-techverse-green/5">
            <div>
              <h3 className="text-lg font-bold text-techverse-green">Content by Category</h3>
              <p className="text-xs text-techverse-green/60 mt-0.5">Topic distribution</p>
            </div>
            <Link to="/explore" className="text-xs font-bold text-techverse-olive hover:underline">
              <span>Explore</span>
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#133215', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-2 max-h-24 overflow-y-auto scrollbar-hide pt-2 border-t border-techverse-green/5">
            {stats.categoryData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs font-semibold text-techverse-green/80">
                <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Overview;

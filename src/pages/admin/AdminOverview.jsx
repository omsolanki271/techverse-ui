import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, MessageSquare, FolderTree,
  ArrowRight, ArrowUpRight, TrendingUp, Calendar,
  Image as ImageIcon, PlusCircle, RefreshCw, Layers
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell
} from 'recharts';
import userService from '../../services/userService';
import postService from '../../services/postService';
import commentService from '../../services/commentService';
import categoryService from '../../services/categoryService';

const CHART_COLORS = ['#133215', '#92B775', '#5a8241', '#a8c691', '#405B36', '#BBD3A5', '#769E58'];

const AdminOverview = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [commentsList, setCommentsList] = useState([]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCategories: 0,
    totalComments: 0,
    activityData: [],
    categoryData: [],
    recentPosts: []
  });

  const fetchData = async () => {
    try {
      const [users, postsRes, categories, comments] = await Promise.all([
        userService.getAllUsers().catch(() => []),
        postService.getAllPosts({ pageNumber: 0, pageSize: 100, sortBy: 'addedDate', sortDirection: 'desc' }).catch(() => ({ content: [], totalElements: 0 })),
        categoryService.getAllCategories().catch(() => []),
        commentService.getAllComments().catch(() => [])
      ]);

      const usersArr = Array.isArray(users) ? users : [];
      const postsArr = postsRes?.content || [];
      const categoriesArr = Array.isArray(categories) ? categories : [];
      const commentsArr = Array.isArray(comments) ? comments : [];

      setUsersList(usersArr);
      setPostsList(postsArr);
      setCategoriesList(categoriesArr);
      setCommentsList(commentsArr);

      // Process Activity Timeline (Past 7 Days)
      const pastDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        pastDays.push({
          dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rawDate: d.toISOString().split('T')[0],
          posts: 0
        });
      }

      postsArr.forEach(post => {
        if (post.addedDate) {
          const postIso = new Date(post.addedDate).toISOString().split('T')[0];
          const matched = pastDays.find(item => item.rawDate === postIso);
          if (matched) {
            matched.posts += 1;
          }
        }
      });

      // Process Category Distribution
      const catCountMap = {};
      categoriesArr.forEach(cat => {
        catCountMap[cat.categoryTitle] = 0;
      });
      postsArr.forEach(post => {
        const title = post.category?.categoryTitle || 'Uncategorized';
        catCountMap[title] = (catCountMap[title] || 0) + 1;
      });

      let categoryData = Object.keys(catCountMap)
        .map(key => ({ name: key, value: catCountMap[key] }))
        .sort((a, b) => b.value - a.value);

      const hasCategoryPosts = categoryData.some(c => c.value > 0);
      if (!hasCategoryPosts) {
        if (categoriesArr.length > 0) {
          categoryData = categoriesArr.slice(0, 5).map(cat => ({
            name: cat.categoryTitle,
            value: 0
          }));
        } else {
          categoryData = [{ name: 'No Categories', value: 0 }];
        }
      }

      setStats({
        totalUsers: usersArr.length,
        totalPosts: postsRes?.totalElements ?? postsArr.length,
        totalCategories: categoriesArr.length,
        totalComments: commentsArr.length,
        activityData: pastDays,
        categoryData: categoryData,
        recentPosts: postsArr.slice(0, 5)
      });
    } catch (err) {
      console.error('Failed to fetch admin overview data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      path: '/admin/users',
      desc: 'Registered authors & members',
      actionText: 'Manage all users',
      badgeColor: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Total Posts',
      value: stats.totalPosts,
      icon: BookOpen,
      path: '/admin/posts',
      desc: 'Published articles & stories',
      actionText: 'Manage all posts',
      badgeColor: 'bg-green-50 text-techverse-green'
    },
    {
      label: 'Total Categories',
      value: stats.totalCategories,
      icon: FolderTree,
      path: '/admin/categories',
      desc: 'Active blog topics',
      actionText: 'Manage categories',
      badgeColor: 'bg-emerald-50 text-emerald-700'
    },
    {
      label: 'Total Comments',
      value: stats.totalComments,
      icon: MessageSquare,
      path: '/admin/comments',
      desc: 'Reader feedback & remarks',
      actionText: 'Review comments',
      badgeColor: 'bg-amber-50 text-amber-700'
    }
  ];

  const quickLinks = [
    { label: 'Users', path: '/admin/users', icon: Users, count: stats.totalUsers },
    { label: 'Posts', path: '/admin/posts', icon: BookOpen, count: stats.totalPosts },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree, count: stats.totalCategories },
    { label: 'Comments', path: '/admin/comments', icon: MessageSquare, count: stats.totalComments },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { label: 'New Article', path: '/editor', icon: PlusCircle, highlight: true }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-techverse-olive mb-4"></div>
        <p className="text-techverse-green/70 font-medium">Loading system metrics & analytics...</p>
      </div>
    );
  }

  const totalCatPosts = stats.categoryData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-techverse-green tracking-tight">System Overview</h1>
          <p className="text-techverse-green/70 text-sm sm:text-base mt-1">
            High-level statistics and real-time activity for the TechVerse platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-white border border-techverse-green/15 text-techverse-green hover:bg-techverse-eggshell transition shadow-sm disabled:opacity-60"
            title="Refresh statistics"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <Link
            to="/editor"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90 transition shadow-sm"
          >
            <PlusCircle size={16} />
            <span>Create Post</span>
          </Link>
        </div>
      </div>

      {/* Clickable Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate(stat.path)}
            className="group relative bg-white p-6 rounded-2xl shadow-sm border border-techverse-green/10 hover:border-techverse-olive hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-techverse-green/60">
                  {stat.label}
                </span>
                <div className="p-3 bg-techverse-olive/20 rounded-xl text-techverse-green group-hover:bg-techverse-green group-hover:text-techverse-eggshell transition-colors duration-200">
                  <stat.icon size={22} />
                </div>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-techverse-green tracking-tight">
                {stat.value}
              </h3>
              <p className="text-xs text-techverse-green/70 mt-1">{stat.desc}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-techverse-green/5 flex items-center justify-between text-xs font-semibold text-techverse-olive group-hover:text-techverse-green transition-colors">
              <span>{stat.actionText}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline Chart (2 Cols) */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-2xl shadow-sm border border-techverse-green/10 lg:col-span-2 flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-techverse-green/5 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-techverse-olive" />
                <h2 className="text-lg font-bold text-techverse-green">Publishing Activity</h2>
              </div>
              <p className="text-xs text-techverse-green/60 mt-0.5">
                Number of articles published across the last 7 days
              </p>
            </div>
            <Link
              to="/admin/posts"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-techverse-olive hover:text-techverse-green hover:underline"
            >
              <span>Manage Posts</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.activityData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminPostGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#133215" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#92B775" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#133215" strokeOpacity={0.08} />
                <XAxis
                  dataKey="dateStr"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#133215', opacity: 0.65, fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#133215', opacity: 0.65, fontSize: 12 }}
                  dx={-5}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-techverse-green text-techverse-eggshell px-3 py-2 rounded-lg shadow-lg text-xs">
                          <p className="font-semibold text-techverse-olive">{label}</p>
                          <p className="font-bold text-sm mt-0.5">{payload[0].value} {payload[0].value === 1 ? 'Post' : 'Posts'}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="posts"
                  stroke="#133215"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#adminPostGradient)"
                  activeDot={{ r: 6, fill: '#92B775', stroke: '#133215', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-techverse-green/5 text-xs text-techverse-green/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-techverse-green inline-block"></span>
              <span>Daily publication volume</span>
            </div>
            <Link to="/admin/posts" className="font-semibold text-techverse-green hover:underline">
              Total {stats.totalPosts} articles in database →
            </Link>
          </div>
        </motion.div>

        {/* Content by Category Pie Chart (1 Col) */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-2xl shadow-sm border border-techverse-green/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-techverse-green/5">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-techverse-olive" />
                <h2 className="text-lg font-bold text-techverse-green">Content by Category</h2>
              </div>
              <p className="text-xs text-techverse-green/60 mt-0.5">Post distribution per category</p>
            </div>
            <Link
              to="/admin/categories"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-techverse-olive hover:text-techverse-green hover:underline"
            >
              <span>Manage</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={totalCatPosts > 0 ? 4 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell
                      key={`cat-cell-${index}`}
                      fill={totalCatPosts > 0 ? CHART_COLORS[index % CHART_COLORS.length] : '#E2E8F0'}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = totalCatPosts > 0 ? ((data.value / totalCatPosts) * 100).toFixed(0) : 0;
                      return (
                        <div className="bg-techverse-green text-techverse-eggshell px-3 py-2 rounded-lg shadow-lg text-xs">
                          <p className="font-semibold text-techverse-olive">{data.name}</p>
                          <p className="font-bold text-sm mt-0.5">{data.value} {data.value === 1 ? 'post' : 'posts'} ({pct}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-techverse-green leading-none">
                {stats.totalCategories}
              </span>
              <span className="text-[11px] font-semibold text-techverse-green/60 uppercase tracking-wider mt-0.5">
                Categories
              </span>
            </div>
          </div>

          {/* Category Chips Legend */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 pt-2 border-t border-techverse-green/5 scrollbar-thin">
            {stats.categoryData.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/admin/categories')}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-techverse-eggshell/60 cursor-pointer transition"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: totalCatPosts > 0 ? CHART_COLORS[idx % CHART_COLORS.length] : '#94A3B8' }}
                  />
                  <span className="font-medium text-techverse-green truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-techverse-green/70 shrink-0 ml-2">
                  {cat.value} {cat.value === 1 ? 'post' : 'posts'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Navigation Cards */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h2 className="text-lg font-bold text-techverse-green">Quick Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center text-center group ${
                item.highlight
                  ? 'bg-techverse-green text-techverse-eggshell border-techverse-green hover:bg-techverse-green/90 shadow-sm'
                  : 'bg-white border-techverse-green/10 text-techverse-green hover:border-techverse-olive hover:shadow-sm'
              }`}
            >
              <item.icon
                size={22}
                className={`mb-2 transition-transform group-hover:scale-110 ${
                  item.highlight ? 'text-techverse-olive' : 'text-techverse-olive group-hover:text-techverse-green'
                }`}
              />
              <span className="text-xs font-bold">{item.label}</span>
              {item.count !== undefined && (
                <span className={`text-[10px] mt-0.5 font-semibold ${item.highlight ? 'text-techverse-eggshell/80' : 'text-techverse-green/60'}`}>
                  {item.count} items
                </span>
              )}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Platform Posts Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-sm border border-techverse-green/10 p-6"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-techverse-green/5">
          <div>
            <h2 className="text-lg font-bold text-techverse-green">Recent Platform Posts</h2>
            <p className="text-xs text-techverse-green/60 mt-0.5">Latest articles published on TechVerse</p>
          </div>
          <Link
            to="/admin/posts"
            className="inline-flex items-center gap-1 text-xs font-bold text-techverse-green hover:text-techverse-olive transition"
          >
            <span>View All Posts</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {stats.recentPosts.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen size={40} className="mx-auto text-techverse-green/30 mb-2" />
            <p className="text-sm font-semibold text-techverse-green/70">No articles published yet.</p>
            <p className="text-xs text-techverse-green/50 mt-1">Write your first article to populate system graphs and feeds.</p>
            <Link
              to="/editor"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90 transition shadow-sm"
            >
              <PlusCircle size={14} />
              <span>Create Post Now</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-techverse-green">
              <thead className="text-xs uppercase bg-techverse-eggshell/50 border-b border-techverse-green/5">
                <tr>
                  <th className="py-3 px-4 font-bold">Post Title</th>
                  <th className="py-3 px-4 font-bold">Author</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-techverse-green/5">
                {stats.recentPosts.map((post) => (
                  <tr key={post.postId} className="hover:bg-techverse-eggshell/40 transition">
                    <td className="py-3 px-4 font-semibold text-techverse-green max-w-xs truncate">
                      <Link to={`/article/${post.postId}`} className="hover:underline hover:text-techverse-olive">
                        {post.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-techverse-green/80">
                      {post.user?.name || post.user?.email || 'Unknown Author'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-techverse-olive/20 text-techverse-green">
                        {post.category?.categoryTitle || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-techverse-green/60">
                      {post.addedDate ? new Date(post.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/admin/posts"
                        className="inline-flex items-center gap-1 text-xs font-bold text-techverse-olive hover:text-techverse-green transition"
                      >
                        <span>Manage</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminOverview;

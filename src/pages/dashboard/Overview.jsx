import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Eye, Users, Clock, ThumbsUp, MessageSquare, TrendingUp, Layers, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';
import commentService from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#133215', '#92B775', '#5a8241', '#a8c691', '#405B36', '#BBD3A5'];

const MetricCard = ({ title, value, icon: Icon, trend, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-xl shadow-sm border border-techverse-green/10 p-6 flex items-center justify-between"
  >
    <div>
      <p className="text-techverse-green/60 font-medium mb-1 text-sm">{title}</p>
      <h4 className="text-2xl font-black text-techverse-green">{value}</h4>
      {trend && (
        <div className="flex items-center mt-2 text-xs font-bold text-techverse-olive">
          <TrendingUp size={14} className="mr-1" />
          {trend}
        </div>
      )}
    </div>
    <div className="w-12 h-12 rounded-full bg-techverse-eggshell/50 flex items-center justify-center text-techverse-green">
      <Icon size={24} />
    </div>
  </motion.div>
);

const Overview = () => {
  const { user, isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalCategories: 0,
    totalViews: 0,
    categoryData: [],
    activityData: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        const userId = user?.id || user?.userId;
        const admin = isAdmin();

        // Safe requests: only call admin endpoints if the user actually has ADMIN role
        const [postsRes, categories, commentsRes] = await Promise.all([
          admin ? postService.getAllPosts({ pageSize: 1000 }) : postService.getPostsByUser(userId, { pageSize: 1000 }),
          categoryService.getAllCategories(),
          admin ? commentService.getAllComments().catch(() => []) : Promise.resolve([])
        ]);
        
        const posts = postsRes?.content || [];
        const cats = categories || [];
        const comments = commentsRes || [];
        
        // Process Category Data
        const catCountMap = {};
        let viewsSum = 0;
        
        posts.forEach(post => {
          viewsSum += (post.views || 0);
          if (post.category) {
            catCountMap[post.category.categoryTitle] = (catCountMap[post.category.categoryTitle] || 0) + 1;
          }
        });
        
        const categoryData = Object.keys(catCountMap).map(key => ({
          name: key,
          value: catCountMap[key]
        })).sort((a, b) => b.value - a.value);

        // Process Activity Data (Posts and Views added over time)
        const dateMap = {};
        posts.forEach(post => {
          if (post.addedDate) {
            const dateStr = new Date(post.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dateMap[dateStr]) dateMap[dateStr] = { posts: 0, views: 0 };
            dateMap[dateStr].posts += 1;
            dateMap[dateStr].views += (post.views || 0);
          }
        });
        
        const activityData = Object.keys(dateMap).map(key => ({
          name: key,
          posts: dateMap[key].posts,
          views: dateMap[key].views
        })).slice(-10); // Last 10 active days

        const avgViews = posts.length > 0 ? Math.round(viewsSum / posts.length) : 0;

        setStats({
          totalPosts: postsRes?.totalElements ?? posts.length,
          totalComments: comments.length,
          totalCategories: cats.length,
          totalViews: viewsSum,
          avgViews,
          categoryData: categoryData.length > 0 ? categoryData : [{ name: 'Uncategorized', value: posts.length || 1 }],
          activityData: activityData.length > 0 ? activityData : [{ name: 'Today', posts: 0, views: 0 }]
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
        <h1 className="text-4xl font-black text-techverse-green tracking-tight">Analytics Overview</h1>
        <p className="text-techverse-green/70 text-lg mt-2">
          {isAdmin() ? 'Track overall platform performance and engagement.' : 'Track your content performance and audience engagement.'}
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Views" value={stats.totalViews} icon={Eye} trend="Real views" delay={0.1} />
        <MetricCard title="Total Posts" value={stats.totalPosts} icon={PenTool} trend="Published" delay={0.2} />
        {isAdmin() ? (
          <MetricCard title="Platform Comments" value={stats.totalComments} icon={MessageSquare} trend="Total" delay={0.3} />
        ) : (
          <MetricCard title="Avg Views / Post" value={stats.avgViews || 0} icon={TrendingUp} trend="Engagement" delay={0.3} />
        )}
        <MetricCard title="Active Categories" value={stats.totalCategories} icon={Layers} trend="Available" delay={0.4} />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Posting Activity Area Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-techverse-green/10 p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-bold text-techverse-green mb-6">Activity (Last Active Days)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#133215" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#133215', opacity: 0.6 }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#133215', opacity: 0.6 }} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="views" stroke="#92B775" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="posts" stroke="#133215" strokeWidth={3} fillOpacity={1} fill="url(#colorPosts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Categories Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-techverse-green/10 p-6 lg:col-span-1"
        >
          <h3 className="text-lg font-bold text-techverse-green mb-6">Content by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#133215', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2 h-16 overflow-y-auto scrollbar-hide">
            {stats.categoryData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs font-bold text-techverse-green/80">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
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

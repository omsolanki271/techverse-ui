import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Eye, Users, Clock, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
const viewsData = [
  { name: 'Mon', views: 4000, visitors: 2400 },
  { name: 'Tue', views: 3000, visitors: 1398 },
  { name: 'Wed', views: 2000, visitors: 9800 },
  { name: 'Thu', views: 2780, visitors: 3908 },
  { name: 'Fri', views: 1890, visitors: 4800 },
  { name: 'Sat', views: 2390, visitors: 3800 },
  { name: 'Sun', views: 3490, visitors: 4300 },
];

const categoryData = [
  { name: 'AI', value: 400 },
  { name: 'Web Dev', value: 300 },
  { name: 'Security', value: 300 },
  { name: 'Cloud', value: 200 },
];

const trafficSourceData = [
  { name: 'Organic Search', value: 45 },
  { name: 'Direct', value: 25 },
  { name: 'Social Media', value: 20 },
  { name: 'Referral', value: 10 },
];

const COLORS = ['#133215', '#92B775', '#5a8241', '#a8c691']; // TechVerse palette variations

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
      <div className="flex items-center mt-2 text-xs font-bold text-techverse-olive">
        <TrendingUp size={14} className="mr-1" />
        {trend} vs last week
      </div>
    </div>
    <div className="w-12 h-12 rounded-full bg-techverse-eggshell/50 flex items-center justify-center text-techverse-green">
      <Icon size={24} />
    </div>
  </motion.div>
);

const Overview = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-techverse-green tracking-tight">Dashboard Overview</h1>
        <p className="text-techverse-green/70 text-lg mt-2">Track your content performance and audience engagement.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Total Views" value="84,291" icon={Eye} trend="+12.5%" delay={0.1} />
        <MetricCard title="Unique Visitors" value="32,492" icon={Users} trend="+8.2%" delay={0.2} />
        <MetricCard title="Avg. Reading Time" value="4m 12s" icon={Clock} trend="+2.1%" delay={0.3} />
        <MetricCard title="Total Likes" value="12,845" icon={ThumbsUp} trend="+15.3%" delay={0.4} />
        <MetricCard title="Total Comments" value="3,210" icon={MessageSquare} trend="+5.4%" delay={0.5} />
        <MetricCard title="Engagement Rate" value="18.4%" icon={TrendingUp} trend="+1.2%" delay={0.6} />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Views Over Time Area Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-techverse-green/10 p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-bold text-techverse-green mb-6">Views & Visitors (Last 7 Days)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#133215" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#133215" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#92B775" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#92B775" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#133215" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#133215', opacity: 0.6 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#133215', opacity: 0.6 }} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="views" stroke="#133215" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="visitors" stroke="#92B775" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Traffic Sources Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-techverse-green/10 p-6 lg:col-span-1"
        >
          <h3 className="text-lg font-bold text-techverse-green mb-6">Traffic Sources</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {trafficSourceData.map((entry, index) => (
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
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {trafficSourceData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs font-bold text-techverse-green/80">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value}%)
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Performance Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-techverse-green/10 p-6 lg:col-span-3"
        >
          <h3 className="text-lg font-bold text-techverse-green mb-6">Category Performance (Views)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#133215" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#133215', opacity: 0.6 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#133215', opacity: 0.6 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#F3E8D3', opacity: 0.5 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#92B775" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#133215' : '#92B775'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Overview;

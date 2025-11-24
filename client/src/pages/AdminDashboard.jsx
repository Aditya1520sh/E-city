import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Users, Calendar, Megaphone, 
  PlusCircle, ArrowRight, Clock, MapPin, Building2, TrendingUp, BarChart3, PieChart
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import AdminStats from '../components/AdminStats';
import { useToast } from '../context/ToastContext';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    issues: [],
    events: [],
    users: [],
    announcements: []
  });
  const [analyticsData, setAnalyticsData] = useState({
    trendData: [],
    categoryData: [],
    departmentData: [],
    statusData: []
  });

  useEffect(() => {
    fetchDashboardData();
    calculateAnalytics();
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [data.issues]);

  const fetchDashboardData = async () => {
    try {
      const [issuesRes, eventsRes, usersRes, announcementsRes] = await Promise.all([
        axiosInstance.get('/issues'),
        axiosInstance.get('/events'),
        axiosInstance.get('/users'),
        axiosInstance.get('/announcements')
      ]);

      setData({
        issues: issuesRes.data,
        events: eventsRes.data,
        users: usersRes.data,
        announcements: announcementsRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    if (!data.issues || data.issues.length === 0) return;

    // Trend Data - Issues over last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = data.issues.filter(issue => {
        const issueDate = new Date(issue.createdAt);
        return issueDate.toDateString() === date.toDateString();
      }).length;
      last7Days.push({ date: dayStr, count });
    }

    // Category Data
    const categoryMap = {};
    data.issues.forEach(issue => {
      categoryMap[issue.category] = (categoryMap[issue.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));

    // Status Data
    const statusMap = {
      pending: 0,
      'in-progress': 0,
      resolved: 0,
      rejected: 0
    };
    data.issues.forEach(issue => {
      statusMap[issue.status] = (statusMap[issue.status] || 0) + 1;
    });
    const statusData = Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // Department Data - Use assigned department or map from category
    const categoryToDepartment = {
      'infrastructure': 'Public Works',
      'sanitation': 'Sanitation',
      'electricity': 'Electricity',
      'water': 'Water Supply',
      'roads': 'Roads & Highways',
      'other': 'General Services'
    };
    
    const deptMap = {};
    data.issues.forEach(issue => {
      const dept = issue.assignedDepartment || categoryToDepartment[issue.category] || issue.category;
      if (!deptMap[dept]) {
        deptMap[dept] = { pending: 0, inProgress: 0, resolved: 0, rejected: 0, total: 0 };
      }
      deptMap[dept].total++;
      if (issue.status === 'resolved') deptMap[dept].resolved++;
      else if (issue.status === 'pending') deptMap[dept].pending++;
      else if (issue.status === 'in-progress') deptMap[dept].inProgress++;
      else if (issue.status === 'rejected') deptMap[dept].rejected++;
    });
    const departmentData = Object.entries(deptMap).map(([name, data]) => ({
      name,
      total: data.total,
      resolved: data.resolved,
      pending: data.pending,
      inProgress: data.inProgress
    })).sort((a, b) => b.total - a.total).slice(0, 6); // Top 6 departments

    setAnalyticsData({
      trendData: last7Days,
      categoryData,
      statusData,
      departmentData
    });
  };

  const getRecentActivity = () => {
    const activities = [
      ...data.issues.map(i => ({ type: 'issue', date: new Date(i.createdAt), data: i })),
      ...data.events.map(e => ({ type: 'event', date: new Date(e.createdAt), data: e })),
      ...data.users.map(u => ({ type: 'user', date: new Date(u.createdAt), data: u })),
      ...data.announcements.map(a => ({ type: 'announcement', date: new Date(a.createdAt), data: a }))
    ];

    return activities
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Comprehensive city management overview.</p>
      </div>

      {/* Enhanced Stats Grid with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="group relative overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-white dark:bg-slate-800 p-7 rounded-2xl border border-blue-200 dark:border-blue-500/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <Activity size={28} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{data.issues.length}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">Total Issues</p>
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Community Reports</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-white dark:bg-slate-800 p-7 rounded-2xl border border-green-200 dark:border-green-500/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <Users size={28} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{data.users.length}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-widest uppercase text-green-600 dark:text-green-400">Active Users</p>
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Registered Citizens</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" style={{width: '90%'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-white dark:bg-slate-800 p-7 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <Calendar size={28} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{data.events.length}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">Events</p>
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Scheduled Activities</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-rose-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-white dark:bg-slate-800 p-7 rounded-2xl border border-orange-200 dark:border-orange-500/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-lg">
                <Megaphone size={28} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">{data.announcements.length}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-widest uppercase text-orange-600 dark:text-orange-400">Announcements</p>
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Public Notices</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full animate-pulse" style={{width: '85%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdminStats issues={data.issues} />

      {/* Advanced Analytics Section */}
      <div className="mt-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="mr-3 text-blue-600 dark:text-blue-400" size={24} />
            Advanced Analytics
          </h2>
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Issue Trends Chart */}
          <div className="group relative overflow-hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-blue-200 dark:border-blue-500/30 shadow-lg">
              <div className="flex items-center mb-4">
                <BarChart3 className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Issue Trends (Last 7 Days)</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analyticsData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #3b82f6',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown Pie Chart */}
          <div className="group relative overflow-hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-lg">
              <div className="flex items-center mb-4">
                <PieChart className="text-purple-600 dark:text-purple-400 mr-2" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category Breakdown</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RePieChart>
                  <Pie
                    data={analyticsData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="group relative overflow-hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-green-200 dark:border-green-500/30 shadow-lg">
              <div className="flex items-center mb-4">
                <Activity className="text-green-600 dark:text-green-400 mr-2" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Status Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analyticsData.statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Performance */}
          <div className="group relative overflow-hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-rose-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-orange-200 dark:border-orange-500/30 shadow-lg">
              <div className="flex items-center mb-4">
                <Building2 className="text-orange-600 dark:text-orange-400 mr-2" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Department Workload</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analyticsData.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '10px' }}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #f97316',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="resolved" fill="#10b981" radius={[8, 8, 0, 0]} name="Resolved" />
                  <Bar dataKey="inProgress" fill="#3b82f6" radius={[8, 8, 0, 0]} name="In Progress" />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Resolution Rate</p>
                <p className="text-4xl font-black mt-2">
                  {data.issues.length > 0 
                    ? Math.round((data.issues.filter(i => i.status === 'resolved').length / data.issues.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp size={32} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Avg Response Time</p>
                <p className="text-4xl font-black mt-2">
                  {data.issues.length > 0
                    ? Math.round(data.issues.reduce((acc, issue) => {
                        if (issue.status === 'resolved' && issue.resolutionTime) {
                          const created = new Date(issue.createdAt);
                          const resolved = new Date(issue.resolutionTime);
                          return acc + (resolved - created) / (1000 * 60 * 60 * 24);
                        }
                        return acc;
                      }, 0) / data.issues.filter(i => i.status === 'resolved').length || 0)
                    : 0}d
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <Clock size={32} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Active Issues</p>
                <p className="text-4xl font-black mt-2">
                  {data.issues.filter(i => i.status === 'pending' || i.status === 'in-progress').length}
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Activity className="mr-3 text-blue-600 dark:text-blue-400" size={20} />
              Recent Activity
            </h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
            <div className="space-y-6">
              {getRecentActivity().map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 p-3 rounded-lg transition-all">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    activity.type === 'issue' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                    activity.type === 'event' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
                    activity.type === 'user' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  }`}>
                    {activity.type === 'issue' && <Activity size={18} />}
                    {activity.type === 'event' && <Calendar size={18} />}
                    {activity.type === 'user' && <Users size={18} />}
                    {activity.type === 'announcement' && <Megaphone size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.type === 'issue' && `New issue reported: ${activity.data.title}`}
                      {activity.type === 'event' && `New event created: ${activity.data.title}`}
                      {activity.type === 'user' && `New citizen registered: ${activity.data.name || activity.data.email}`}
                      {activity.type === 'announcement' && `Announcement posted: ${activity.data.title}`}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 space-x-3">
                      <span className="flex items-center"><Clock size={12} className="mr-1" /> {formatTimeAgo(activity.date)}</span>
                      {activity.type === 'issue' && (
                        <span className="flex items-center"><MapPin size={12} className="mr-1" /> {activity.data.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {getRecentActivity().length === 0 && (
                <div className="text-center text-slate-400 py-8">No recent activity</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/announcements')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
              >
                <div className="flex items-center">
                  <Megaphone size={18} className="mr-3 text-gray-400 group-hover:text-blue-500" />
                  <span className="font-medium">Post Announcement</span>
                </div>
                <PlusCircle size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => navigate('/admin/events')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
              >
                <div className="flex items-center">
                  <Calendar size={18} className="mr-3 text-gray-400 group-hover:text-indigo-500" />
                  <span className="font-medium">Create Event</span>
                </div>
                <PlusCircle size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => navigate('/admin/users')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all group"
              >
                <div className="flex items-center">
                  <Users size={18} className="mr-3 text-gray-400 group-hover:text-green-500" />
                  <span className="font-medium">Manage Users</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => navigate('/admin/departments')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all group"
              >
                <div className="flex items-center">
                  <Building2 size={18} className="mr-3 text-gray-400 group-hover:text-orange-500" />
                  <span className="font-medium">Manage Departments</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Server Status</span>
                <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-bold">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Database</span>
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Last Backup</span>
                <span className="text-gray-900 dark:text-white text-sm">2 hours ago</span>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Storage Usage</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

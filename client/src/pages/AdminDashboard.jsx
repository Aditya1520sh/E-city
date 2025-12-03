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

  // Navigation helpers for Flight Deck actions
  const goToDepartment = (deptName, action = 'view') => {
    const encoded = encodeURIComponent(deptName || '');
    if (action === 'assign') {
      navigate(`/admin/departments?dept=${encoded}&action=assign`);
    } else if (action === 'escalate') {
      navigate(`/admin/departments?dept=${encoded}&action=escalate`);
    } else {
      navigate(`/admin/departments?dept=${encoded}`);
    }
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
      {/* City Pulse Header */}
      <div className="mb-4 sm:mb-6">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" aria-hidden="true"></div>
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                City Mission Control
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                A human-centered overview of ongoing civic work.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                <Activity size={16} className="text-emerald-600" />
                <span className="text-xs font-semibold">Urgent: {data.issues.filter(i => i.priority === 'high' || i.status === 'pending').length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                <Calendar size={16} className="text-indigo-600" />
                <span className="text-xs font-semibold">Events: {data.events.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                <Megaphone size={16} className="text-amber-600" />
                <span className="text-xs font-semibold">Notices: {data.announcements.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                <Users size={16} className="text-blue-600" />
                <span className="text-xs font-semibold">Citizens: {data.users.length}</span>
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

        {/* Analytics Charts Grid (civic theming) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Issue Trends Chart */}
          <div className="group relative overflow-hidden">
            <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <BarChart3 className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Issue Trends (Last 7 Days)</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analyticsData.trendData}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" opacity={0.8} />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #2563eb',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  {/* Use a distinct color for trends */}
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0ea5e9" /* sky-500 */
                    strokeWidth={2.5}
                    dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Heatbands (replaces pie with civic heatbars) */}
          <div className="group relative overflow-hidden">
            <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <PieChart className="text-purple-600 dark:text-purple-400 mr-2" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category Heatbands</h3>
              </div>
              <div className="space-y-3">
                {analyticsData.categoryData.map((cat, idx) => {
                  // Expanded 16-color palette for unique category colors
                  const categoryColors = [
                    '#2563eb', // blue-600
                    '#7c3aed', // violet-600
                    '#ea580c', // orange-600
                    '#16a34a', // green-600
                    '#0ea5e9', // sky-500
                    '#dc2626', // red-600
                    '#f59e0b', // amber-500
                    '#14b8a6', // teal-500
                    '#8b5cf6', // purple-500
                    '#ec4899', // pink-500
                    '#06b6d4', // cyan-500
                    '#84cc16', // lime-500
                    '#f97316', // orange-500
                    '#6366f1', // indigo-500
                    '#10b981', // emerald-500
                    '#f43f5e'  // rose-500
                  ];
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 truncate">{cat.name}</span>
                      <div className="flex-1 h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ 
                            width: `${Math.max(6, (cat.value / Math.max(1, analyticsData.categoryData.reduce((m, c) => Math.max(m, c.value), 1))) * 100)}%`, 
                            backgroundColor: categoryColors[idx % categoryColors.length] 
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-10 text-right">{cat.value}</span>
                    </div>
                  );
                })}
                {analyticsData.categoryData.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No category data</div>
                )}
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="group relative overflow-hidden">
            <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Activity className="text-green-600 dark:text-green-400 mr-2" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Status Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analyticsData.statusData}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" opacity={0.8} />
                  <XAxis
                    dataKey="name"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #16a34a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  {/* Per-status colors and labels */}
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {analyticsData.statusData.map((entry, idx) => {
                      const colorMap = {
                        Pending: '#f59e0b',
                        'In-progress': '#2563eb',
                        Resolved: '#16a34a',
                        Rejected: '#b91c1c'
                      };
                      const fillColor = colorMap[entry.name] || ['#16a34a', '#2563eb', '#f59e0b', '#b91c1c'][idx % 4];
                      return <Cell key={`status-cell-${idx}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white">
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

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white">
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

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Activity className="mr-3 text-blue-600 dark:text-blue-400" size={24} />
              Activity Feed
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Live Updates</span>
          </div>
          <div className="p-6 flex-1 overflow-y-auto max-h-[600px]">
            <div className="space-y-6">
              {getRecentActivity().map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 p-3 rounded-lg transition-all">
                  <div className={`p-2 rounded-lg shrink-0 ${activity.type === 'issue' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
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

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center">
              <PlusCircle className="mr-2 text-blue-600 dark:text-blue-400" size={20} />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/announcements')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all group"
              >
                <div className="flex items-center">
                  <Megaphone size={18} className="mr-3 text-gray-500 group-hover:text-amber-600" />
                  <span className="font-medium">Post Announcement</span>
                </div>
                <PlusCircle size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => navigate('/admin/events')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all group"
              >
                <div className="flex items-center">
                  <Calendar size={18} className="mr-3 text-gray-500 group-hover:text-indigo-600" />
                  <span className="font-medium">Create Event</span>
                </div>
                <PlusCircle size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all group"
              >
                <div className="flex items-center">
                  <Users size={18} className="mr-3 text-gray-500 group-hover:text-green-600" />
                  <span className="font-medium">Manage Users</span>
                </div>
                <ArrowRight size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => navigate('/admin/departments')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all group"
              >
                <div className="flex items-center">
                  <Building2 size={18} className="mr-3 text-gray-500 group-hover:text-orange-600" />
                  <span className="font-medium">Manage Departments</span>
                </div>
                <ArrowRight size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

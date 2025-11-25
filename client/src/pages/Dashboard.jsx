import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Search, Filter, MapPin, ArrowRight, User, Megaphone, Calendar } from 'lucide-react';
import UserLayout from '../layouts/UserLayout';
import { useToast } from '../context/ToastContext';
import { Analytics } from "@vercel/analytics/react";

const Dashboard = ({ myReportsOnly = false }) => {
  const [issues, setIssues] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalIssues: 0, resolvedIssues: 0, pendingIssues: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', status: 'all', search: '', myIssues: myReportsOnly });
  const user = JSON.parse(localStorage.getItem('user'));
  const { addToast } = useToast();

  useEffect(() => {
    setFilters(prev => ({ ...prev, myIssues: myReportsOnly }));
  }, [myReportsOnly]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const ROOT_BASE = API_BASE.replace(/\/api$/, '');
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      // Always fetch user's issues for the main dashboard view as requested
      params.append('userId', user.id);

      const [issuesRes, statsRes] = await Promise.all([
        axiosInstance.get(`/issues?${params.toString()}`),
        axiosInstance.get(`/stats?userId=${user.id}`)
      ]);
      setIssues(issuesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFilters({ ...filters, [e.target.name]: value });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-2xl"></div>
            ))}
          </div>

          <div className="h-16 bg-gray-200 dark:bg-slate-700 rounded-xl mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            My Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your contributions to the community.
          </p>
        </div>
        <Link to="/report" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center w-full md:w-auto gap-2">
          <AlertCircle size={20} />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Enhanced Stats Cards with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group relative overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-white dark:bg-slate-800 p-7 rounded-2xl border border-blue-200 dark:border-blue-500/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                <Clock size={28} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalIssues}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">Total Issues</p>
              <p className="text-gray-700 dark:text-gray-300 font-semibold">Your Reports</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-white dark:bg-slate-800 p-7 rounded-2xl border border-green-200 dark:border-green-500/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <CheckCircle size={28} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.resolvedIssues}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-widest uppercase text-green-600 dark:text-green-400">Resolved Issues</p>
              <p className="text-gray-700 dark:text-gray-300 font-semibold">{stats.totalIssues > 0 ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0}% Success Rate</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" style={{width: `${stats.totalIssues > 0 ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0}%`}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-white dark:bg-slate-800 p-7 rounded-2xl border border-amber-200 dark:border-amber-500/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <AlertCircle size={28} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-5xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{stats.pendingIssues}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400">Pending Issues</p>
              <p className="text-gray-700 dark:text-gray-300 font-semibold">In Progress</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse" style={{width: `${stats.totalIssues > 0 ? Math.round((stats.pendingIssues / stats.totalIssues) * 100) : 0}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4 items-center sticky top-4 z-10 transition-colors duration-200">\n        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            name="search"
            placeholder="Search your issues..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto items-center">
          <select
            name="category"
            className="flex-1 md:w-48 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer bg-white dark:bg-slate-700 dark:text-white"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="all">All Categories</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="sanitation">Sanitation</option>
            <option value="electricity">Electricity</option>
            <option value="other">Other</option>
          </select>
          <select
            name="status"
            className="flex-1 md:w-48 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer bg-white dark:bg-slate-700 dark:text-white"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Issues Grid */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Reports</h2>
      {issues.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
          <p className="text-gray-500 dark:text-gray-400">You haven't reported any issues yet.</p>
          <Link to="/report" className="text-blue-600 font-medium mt-2 inline-block hover:underline">Report your first issue</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <Link 
              to={`/issues/${issue.id}`} 
              key={issue.id}
              className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 flex flex-col transform hover:scale-[1.02]"
            >
              <div className="h-48 bg-gray-100 dark:bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                {issue.imageUrl ? (
                  <img 
                    src={issue.imageUrl} 
                    alt={issue.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
                    <AlertCircle size={48} opacity={0.2} />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(issue.status)} shadow-sm`}>
                    {issue.status}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-2">
                  <span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded capitalize">{issue.category}</span>
                  <span>•</span>
                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {issue.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
                  {issue.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-700 mt-auto">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <MapPin size={16} className="mr-1" />
                    <span className="truncate max-w-[150px]">{issue.location}</span>
                  </div>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Details <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Analytics />
    </UserLayout>
  );
};

export default Dashboard;

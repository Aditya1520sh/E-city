import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';

const AdminStats = ({ issues }) => {
  // Data Processing
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const pendingIssues = issues.filter(i => i.status === 'pending').length;
  const rejectedIssues = issues.filter(i => i.status === 'rejected').length;

  const statusData = [
    { name: 'Pending', value: pendingIssues, color: '#F59E0B' },
    { name: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length, color: '#3B82F6' },
    { name: 'Resolved', value: resolvedIssues, color: '#10B981' },
    { name: 'Rejected', value: rejectedIssues, color: '#DC2626' },
  ];

  const categoryData = issues.reduce((acc, issue) => {
    const existing = acc.find(item => item.name === issue.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: issue.category, value: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  // Trend Data (Last 7 Days)
  const getTrendData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: issues.filter(i => i.createdAt.startsWith(date)).length
    }));
  };
  const trendData = getTrendData();

  const StatCard = ({ title, value, icon: Icon, color, bgColor, gradient }) => (
    <div className={`relative overflow-hidden group ${gradient} p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-4xl font-extrabold text-white">{value}</h3>
        </div>
        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
          <Icon size={28} className="text-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
    </div>
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Issues" 
          value={totalIssues} 
          icon={Activity} 
          gradient="bg-gradient-to-br from-blue-500 to-blue-700" 
        />
        <StatCard 
          title="Resolved" 
          value={resolvedIssues} 
          icon={CheckCircle} 
          gradient="bg-gradient-to-br from-green-500 to-emerald-600" 
        />
        <StatCard 
          title="Pending" 
          value={pendingIssues} 
          icon={Clock} 
          gradient="bg-gradient-to-br from-amber-500 to-orange-600" 
        />
        <StatCard 
          title="Rejected" 
          value={rejectedIssues} 
          icon={AlertCircle} 
          gradient="bg-gradient-to-br from-red-500 to-rose-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Reporting Trend</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Last 7 Days</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} strokeOpacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;

import React, { useState, useEffect } from 'react';
import UserLayout from '../layouts/UserLayout';
import { Megaphone, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const UserAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE + '/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      showToast('Error fetching announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="text-red-500" size={24} />;
      case 'low': return <CheckCircle className="text-green-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'low': return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10';
      default: return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen dark:text-white">Loading...</div>;

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Important updates and news from the city administration.</p>
      </div>

      <div className="space-y-4 max-w-4xl">
        {announcements.map((ann) => (
          <div key={ann.id} className={`p-6 rounded-xl shadow-sm ${getPriorityStyles(ann.priority)} transition-all hover:shadow-md`}>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                {getPriorityIcon(ann.priority)}
              </div>
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ann.title}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap sm:ml-4">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
                  {ann.content}
                </p>
                {ann.priority === 'high' && (
                  <div className="mt-3 inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase dark:bg-red-900/30 dark:text-red-300">
                    Urgent Attention Required
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </UserLayout>
  );
};

export default UserAnnouncements;

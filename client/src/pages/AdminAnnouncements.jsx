import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../layouts/AdminLayout';
import {
  Megaphone,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  Calendar,
  Eye
} from 'lucide-react';

const priorityConfig = {
  low: {
    gradient: 'from-green-400 to-emerald-500',
    icon: Info,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-500',
    textColor: 'text-green-700 dark:text-green-400',
    label: 'Low Priority'
  },
  medium: {
    gradient: 'from-blue-400 to-indigo-500',
    icon: AlertCircle,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700 dark:text-blue-400',
    label: 'Medium Priority'
  },
  high: {
    gradient: 'from-orange-400 to-red-500',
    icon: AlertTriangle,
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700 dark:text-orange-400',
    label: 'High Priority'
  },
  urgent: {
    gradient: 'from-red-500 to-pink-600',
    icon: Zap,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-500',
    textColor: 'text-red-700 dark:text-red-400',
    label: 'Urgent'
  }
};

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'medium' });
  const [expandedCards, setExpandedCards] = useState(new Set());
  const { showToast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get('/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showToast('Error fetching announcements', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/announcements', formData);
      showToast('Announcement posted', 'success');
      setFormData({ title: '', content: '', priority: 'medium' });
      setAnnouncements([response.data, ...announcements]);
    } catch (error) {
      console.error('Error posting announcement:', error);
      showToast('Error posting announcement', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axiosInstance.delete(`/announcements/${id}`);
      showToast('Announcement deleted', 'success');
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showToast('Error deleting announcement', 'error');
    }
  };

  const toggleExpand = (id) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Broadcast important updates to citizens
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Eye className="w-4 h-4" />
            <span>{announcements.length} Active</span>
          </div>
        </div>

        {/* Create Form */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Announcement</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Announcement Title"
                className="md:col-span-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <select
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🔵 Medium Priority</option>
                <option value="high">🟠 High Priority</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
            <textarea
              placeholder="Announcement content..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
              rows="4"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Post Announcement
            </motion.button>
          </form>
        </motion.div>

        {/* Announcements List */}
        <div className="space-y-4">
          <AnimatePresence>
            {announcements.map((announcement, index) => {
              const config = priorityConfig[announcement.priority] || priorityConfig.medium;
              const Icon = config.icon;
              const isExpanded = expandedCards.has(announcement.id);

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${config.borderColor}`}
                >
                  {/* Priority Indicator Strip */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-10 rounded-bl-full`}></div>

                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Icon and Content */}
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-3 ${config.bgColor} rounded-xl`}>
                          <Icon className={`w-6 h-6 ${config.textColor}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {announcement.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-semibold uppercase rounded-full ${config.bgColor} ${config.textColor}`}>
                              {config.label}
                            </span>
                          </div>

                          <AnimatePresence mode="wait">
                            {isExpanded ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4"
                              >
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                                  {announcement.content}
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Posted:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Time:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {new Date(announcement.createdAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Priority Level:</span>
                                    <span className={`font-bold ${config.textColor}`}>
                                      {config.label}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-3"
                              >
                                {announcement.content}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleExpand(announcement.id)}
                              className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  Show Less <ChevronUp className="w-4 h-4 ml-1" />
                                </>
                              ) : (
                                <>
                                  Show More <ChevronDown className="w-4 h-4 ml-1" />
                                </>
                              )}
                            </button>

                            {!isExpanded && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {announcements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
            >
              <Megaphone className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No announcements yet. Create your first one above!</p>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;

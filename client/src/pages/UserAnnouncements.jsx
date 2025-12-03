import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import UserLayout from '../layouts/UserLayout';
import {
  Megaphone,
  AlertCircle,
  Info,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  Calendar,
  Bell
} from 'lucide-react';

const priorityConfig = {
  low: {
    gradient: 'from-green-400 to-emerald-500',
    icon: Info,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-500',
    textColor: 'text-green-700 dark:text-green-400',
    label: 'Low Priority',
    pulse: false
  },
  medium: {
    gradient: 'from-blue-400 to-indigo-500',
    icon: AlertCircle,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700 dark:text-blue-400',
    label: 'Medium Priority',
    pulse: false
  },
  high: {
    gradient: 'from-orange-400 to-red-500',
    icon: AlertTriangle,
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700 dark:text-orange-400',
    label: 'High Priority',
    pulse: true
  },
  urgent: {
    gradient: 'from-red-500 to-pink-600',
    icon: Zap,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-500',
    textColor: 'text-red-700 dark:text-red-400',
    label: 'Urgent',
    pulse: true
  }
};

const UserAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get('/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
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

  const urgentCount = announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length;

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">City Announcements</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Stay updated with important city notifications
            </p>
          </div>
          {urgentCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full shadow-lg"
            >
              <Bell className="w-4 h-4 animate-pulse" />
              <span className="font-semibold text-sm">{urgentCount} Urgent Alert{urgentCount > 1 ? 's' : ''}</span>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {announcements.map((announcement, index) => {
                const config = priorityConfig[announcement.priority] || priorityConfig.medium;
                const Icon = config.icon;
                const isExpanded = expandedCards.has(announcement.id);

                return (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${config.borderColor} ${config.pulse ? 'animate-pulse-slow' : ''}`}
                  >
                    {/* Gradient Background Accent */}
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${config.gradient} opacity-10 rounded-bl-full`}></div>

                    {/* Urgent Badge */}
                    {config.pulse && (
                      <div className="absolute top-4 right-4">
                        <span className={`relative flex h-3 w-3`}>
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.bgColor} opacity-75`}></span>
                          <span className={`relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r ${config.gradient}`}></span>
                        </span>
                      </div>
                    )}

                    <div className="relative p-6">
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          className={`p-3 ${config.bgColor} rounded-xl flex-shrink-0`}
                        >
                          <Icon className={`w-6 h-6 ${config.textColor}`} />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                              {announcement.title}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${config.bgColor} ${config.textColor} whitespace-nowrap`}>
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
                                className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed"
                              >
                                {announcement.content}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center justify-between">
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
                                  Read More <ChevronDown className="w-4 h-4 ml-1" />
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
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty State */}
            {announcements.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
              >
                <Megaphone className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Announcements</h3>
                <p className="text-gray-500 dark:text-gray-400">Check back later for city updates and notifications</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </UserLayout>
  );
};

export default UserAnnouncements;

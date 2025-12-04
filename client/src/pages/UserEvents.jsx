import React, { useState, useEffect } from 'react';
import UserLayout from '../layouts/UserLayout';
import { Calendar, MapPin, Clock, Users, User, Search, Filter, Grid, List, Sparkles, TrendingUp } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../utils/axios';

const UserEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [joinedEvents, setJoinedEvents] = useState(new Set());
  const { showToast } = useToast();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedType, selectedDate]);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get('/events');
      const data = response.data;
      
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('Events data is not an array:', data);
        setEvents([]);
        showToast('Invalid events data received', 'error');
      }

      // Track which events user has joined (backend provides isJoined)
      if (user) {
        const joined = new Set(
          data
            .filter(event => event.isJoined)
            .map(event => event.id)
        );
        setJoinedEvents(joined);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Error fetching events: ' + error.message, 'error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (!Array.isArray(events)) {
      console.log('Events is not an array, returning early');
      return;
    }
    
    console.log('Filtering events. Total events:', events.length);
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search filter:', filtered.length, 'events');
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
      console.log('After type filter:', filtered.length, 'events');
    }

    // Date filter
    const now = new Date();
    if (selectedDate === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date) > now);
      console.log('After upcoming filter:', filtered.length, 'events');
    } else if (selectedDate === 'week') {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > now && eventDate <= weekFromNow;
      });
      console.log('After week filter:', filtered.length, 'events');
    } else if (selectedDate === 'month') {
      const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > now && eventDate <= monthFromNow;
      });
      console.log('After month filter:', filtered.length, 'events');
    }

    console.log('Final filtered events:', filtered.length);
    setFilteredEvents(filtered);
  };

  const handleJoinEvent = async (eventId) => {
    if (!user) {
      showToast('Please login to join events', 'error');
      return;
    }

    try {
      await axiosInstance.post(`/events/${eventId}/join`);
      setJoinedEvents(new Set([...joinedEvents, eventId]));

      // Update local event data
      setEvents(events.map(event =>
        event.id === eventId
          ? { ...event, isJoined: true, participantCount: (event.participantCount || 0) + 1 }
          : event
      ));

      showToast('Successfully joined event!', 'success');
    } catch (error) {
      console.error('Error joining event:', error);
      showToast(error.response?.data?.error || 'Error joining event', 'error');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await axiosInstance.post(`/events/${eventId}/leave`);
      const newJoined = new Set(joinedEvents);
      newJoined.delete(eventId);
      setJoinedEvents(newJoined);

      // Update local event data
      setEvents(events.map(event =>
        event.id === eventId
          ? { ...event, isJoined: false, participantCount: Math.max(0, (event.participantCount || 0) - 1) }
          : event
      ));

      showToast('Left event', 'success');
    } catch (error) {
      console.error('Error leaving event:', error);
      showToast('Error leaving event', 'error');
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'cultural': return 'from-purple-500 to-pink-500';
      case 'educational': return 'from-blue-500 to-cyan-500';
      case 'healthcare': return 'from-red-500 to-orange-500';
      case 'workshop': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getEventTypeBadgeColor = (type) => {
    switch (type) {
      case 'cultural': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'educational': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'healthcare': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'workshop': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  console.log('Rendering UserEvents. Events:', events.length, 'Filtered:', filteredEvents.length);

  return (
    <UserLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Calendar size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">Community Events</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Discover and join exciting events in your city</p>
          </div>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white transition-all"
          >
            <option value="all">All Types</option>
            <option value="cultural">Cultural</option>
            <option value="educational">Educational</option>
            <option value="healthcare">Healthcare</option>
            <option value="workshop">Workshop</option>
            <option value="general">General</option>
          </select>

          {/* Date Filter */}
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white transition-all"
          >
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Stats & View Toggle */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              <span className="text-blue-600 dark:text-blue-400 font-bold">{filteredEvents.length}</span> events found
            </span>
            {joinedEvents.size > 0 && (
              <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                <Sparkles size={16} className="mr-1" />
                Joined {joinedEvents.size}
              </span>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-slate-600'}`}
            >
              <Grid size={18} className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-slate-600'}`}
            >
              <List size={18} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Events Grid/List */}
      <div className="relative z-0">
        {filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
            <Calendar size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                viewMode={viewMode}
                isJoined={joinedEvents.has(event.id)}
                onJoin={() => handleJoinEvent(event.id)}
                onLeave={() => handleLeaveEvent(event.id)}
                getEventTypeColor={getEventTypeColor}
                getEventTypeBadgeColor={getEventTypeBadgeColor}
              />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

const EventCard = ({ event, index, viewMode, isJoined, onJoin, onLeave, getEventTypeColor, getEventTypeBadgeColor }) => {
  const participantCount = event.participantCount || 0;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row"
      >
        {/* Image */}
        <div className="w-full sm:w-48 h-48 sm:h-auto relative flex-shrink-0">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${getEventTypeColor(event.type)} opacity-20`}></div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getEventTypeBadgeColor(event.type)}`}>
                {event.type}
              </span>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock size={14} className="mr-1" />
                {new Date(event.date).toLocaleDateString()}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{event.description}</p>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <MapPin size={16} className="mr-1 text-blue-500" />
                {event.location}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Users size={16} className="mr-1" />
                {participantCount} joined
              </div>
            </div>
          </div>

          {/* Join Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isJoined ? onLeave : onJoin}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all ${isJoined
              ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
              }`}
          >
            {isJoined ? 'Leave' : 'Join Event'}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
    >
      {/* Image with Gradient Overlay */}
      <div className="h-56 relative overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
          src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${getEventTypeColor(event.type)} opacity-30 group-hover:opacity-40 transition-opacity`}></div>

        {/* Type Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg backdrop-blur-sm ${getEventTypeBadgeColor(event.type)}`}>
            {event.type}
          </span>
        </div>

        {/* Joined Badge */}
        {isJoined && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg backdrop-blur-sm flex items-center">
              <Sparkles size={14} className="mr-1" />
              Joined
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <Clock size={16} className="mr-2" />
          <span className="font-medium">{new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">{event.title}</h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
          {event.description}
        </p>

        {/* Footer */}
        <div className="space-y-3 mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
              <MapPin size={18} className="mr-2 text-blue-500" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 font-medium">
              <Users size={18} className="mr-1.5" />
              {participantCount}
            </div>
          </div>

          {/* Join Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={isJoined ? onLeave : onJoin}
            className={`w-full py-3 rounded-xl font-bold transition-all ${isJoined
              ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
              }`}
          >
            {isJoined ? 'Leave Event' : 'Join Event'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserEvents;

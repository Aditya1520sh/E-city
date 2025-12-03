import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../layouts/AdminLayout';
import { Calendar, MapPin, Clock, Users, Plus, Trash2, TrendingUp, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    organizer: '',
    type: 'general',
    imageUrl: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get('/events');
      // Deduplicate events by ID just in case
      const uniqueEvents = Array.from(new Map(response.data.map(item => [item.id, item])).values());
      setEvents(uniqueEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Error fetching events', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Auto-assign image if not provided
    let imageUrl = formData.imageUrl;
    if (!imageUrl) {
      const type = formData.type || 'general';
      const imageCollections = {
        cultural: [
          'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1560964645-4c9509f72f94?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'
        ],
        educational: [
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'
        ],
        healthcare: [
          'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1532938911079-1da8fc086224?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1576091160399-112da8d25e92?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80'
        ],
        workshop: [
          'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517048696773-fd7785381eb8?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80'
        ],
        general: [
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1511578314322-379afb0725f0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1464047736614-af63643285bf?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
        ]
      };

      const collection = imageCollections[type] || imageCollections.general;
      // Use current timestamp to get different image each time
      const imageIndex = (events.length + Date.now()) % collection.length;
      imageUrl = collection[imageIndex];
    }

    try {
      const response = await axiosInstance.post('/events', { ...formData, imageUrl });
      showToast('Event created successfully!', 'success');
      setFormData({ title: '', description: '', date: '', location: '', organizer: '', type: 'general', imageUrl: '' });

      // Add the new event to the list. 
      // Ensure we don't add duplicates if the backend response is somehow delayed or retried.
      setEvents(prevEvents => {
        if (prevEvents.some(e => e.id === response.data.id)) {
          return prevEvents;
        }
        return [...prevEvents, { ...response.data, participantCount: 0 }];
      });

      setShowModal(false);
    } catch (error) {
      console.error('Error creating event:', error);
      showToast('Error creating event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axiosInstance.delete(`/events/${id}`);
      showToast('Event deleted successfully!', 'success');
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('Error deleting event', 'error');
    }
  };

  // Calculate statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  // Fix: Use participantCount from backend response
  const totalParticipants = events.reduce((sum, e) => sum + (e.participantCount || 0), 0);

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

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-white">Events Management</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Create and manage community events</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
          >
            <Plus size={20} />
            <span>Create Event</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Statistics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <StatCard
          icon={<Calendar size={24} />}
          label="Total Events"
          value={totalEvents}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Upcoming Events"
          value={upcomingEvents}
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={<Users size={24} />}
          label="Total Participants"
          value={totalParticipants}
          color="from-purple-500 to-pink-500"
        />
      </motion.div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            index={index}
            onDelete={() => handleDelete(event.id)}
            getEventTypeColor={getEventTypeColor}
            getEventTypeBadgeColor={getEventTypeBadgeColor}
          />
        ))}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-6">Create New Event</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Event Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter event title"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-slate-900 dark:text-white transition-all"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    {/* Date & Time */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-slate-900 dark:text-white transition-all"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>

                    {/* Event Type */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Event Type *
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-slate-900 dark:text-white transition-all"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="general">General</option>
                        <option value="cultural">Cultural</option>
                        <option value="educational">Educational</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="workshop">Workshop</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        placeholder="Event location"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-slate-900 dark:text-white transition-all"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    {/* Organizer */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Organizer *
                      </label>
                      <input
                        type="text"
                        placeholder="Organizer name"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-slate-900 dark:text-white transition-all"
                        value={formData.organizer}
                        onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                        required
                      />
                    </div>

                    {/* Image URL */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Image URL (Optional)
                      </label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="text"
                          placeholder="Leave blank for auto-generated image"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-slate-900 dark:text-white transition-all"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        placeholder="Describe the event..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-transparent focus:border-blue-500 rounded-xl text-slate-900 dark:text-white transition-all h-32 resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center space-x-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Event'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 overflow-hidden relative"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
    <div className="relative">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 shadow-lg`}>
        {icon}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wide mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-800 dark:text-white">{value}</p>
    </div>
  </motion.div>
);

const EventCard = ({ event, index, onDelete, getEventTypeColor, getEventTypeBadgeColor }) => {
  const participantCount = event.participantCount || 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      {/* Image Container */}
      <div className="h-56 relative overflow-hidden">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${getEventTypeColor(event.type)} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>

        {/* Overlay Gradient for Text Readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Type Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg backdrop-blur-md ${getEventTypeBadgeColor(event.type)}`}>
            {event.type}
          </span>
        </div>

        {/* Past Event Badge */}
        {isPast && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-800/80 text-white shadow-lg backdrop-blur-md border border-gray-700">
              Past Event
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3 space-x-2">
          <Clock size={16} className="text-blue-500" />
          <span className="font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-blue-700 dark:text-blue-300">
            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="font-medium">
            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>

        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
          {event.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto">
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex items-center text-slate-700 dark:text-slate-300 group/loc">
              <MapPin size={16} className="mr-2 text-red-500 group-hover/loc:scale-110 transition-transform" />
              <span className="font-medium truncate max-w-[140px]" title={event.location}>{event.location}</span>
            </div>
            <div className="flex items-center text-slate-600 dark:text-slate-400 group/users">
              <Users size={16} className="mr-2 text-purple-500 group-hover/users:scale-110 transition-transform" />
              <span className="font-bold text-slate-800 dark:text-slate-200">{participantCount}</span>
              <span className="ml-1 text-xs text-slate-500">participants</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-md transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
            title="Delete Event"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;

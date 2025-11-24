import React, { useState, useEffect } from 'react';
import UserLayout from '../layouts/UserLayout';
import { Calendar, MapPin, Clock, Users, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const UserEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      // Add timestamp to prevent caching
      const response = await fetch(`${API_BASE}/events?t=${Date.now()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Error fetching events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'cultural': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'educational': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'healthcare': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'workshop': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen dark:text-white">Loading...</div>;

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Events</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Discover what's happening in your city.</p>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} getEventTypeColor={getEventTypeColor} />
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

const EventCard = ({ event, getEventTypeColor }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
      <div className="h-48 bg-gray-200 dark:bg-slate-700 relative">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'; // Fallback image
            }}
          />
        ) : (
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80" 
            alt="Event placeholder" 
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${getEventTypeColor(event.type)}`}>
            {event.type}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Clock size={16} className="mr-1" />
          <span>{new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
          {event.description}
        </p>
        
        <div className="space-y-2 mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm font-medium">
            <MapPin size={18} className="mr-2 text-blue-500" />
            <span className="truncate">{event.location}</span>
          </div>
          
          {event.organizer && (
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <User size={18} className="mr-2" />
              <span className="truncate">Organized by {event.organizer}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEvents;

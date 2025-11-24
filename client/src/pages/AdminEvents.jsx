import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../layouts/AdminLayout';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', type: 'general', imageUrl: '' });
  const { showToast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Error fetching events', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-assign image if not provided
    let imageUrl = formData.imageUrl;
    if (!imageUrl) {
      const type = formData.type || 'general';
      const imageCollections = {
        cultural: [
          'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1560964645-4c9509f72f94?auto=format&fit=crop&w=800&q=80'
        ],
        educational: [
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
        ],
        healthcare: [
          'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1532938911079-1da8fc086224?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1576091160399-112da8d25e92?auto=format&fit=crop&w=800&q=80'
        ],
        workshop: [
          'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517048696773-fd7785381eb8?auto=format&fit=crop&w=800&q=80'
        ],
        general: [
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1511578314322-379afb0725f0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1464047736614-af63643285bf?auto=format&fit=crop&w=800&q=80'
        ]
      };
      
      const collection = imageCollections[type] || imageCollections.general;
      imageUrl = collection[Math.floor(Math.random() * collection.length)];
    }

    try {
      const response = await axiosInstance.post('/events', { ...formData, imageUrl });
      showToast('Event created', 'success');
      setFormData({ title: '', description: '', date: '', location: '', type: 'general', imageUrl: '' });
      // Update local state immediately
      setEvents([...events, response.data]);
    } catch (error) {
      console.error('Error creating event:', error);
      showToast('Error creating event', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axiosInstance.delete(`/events/${id}`);
      showToast('Event deleted', 'success');
      // Update local state immediately
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('Error deleting event', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Events Management</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Event Title"
            className="border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <input
            type="datetime-local"
            className="border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Location"
            className="border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
          <select
            className="border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="general">General</option>
            <option value="cultural">Cultural</option>
            <option value="educational">Educational</option>
            <option value="healthcare">Healthcare</option>
            <option value="workshop">Workshop</option>
          </select>
          <input
            type="text"
            placeholder="Image URL (Optional)"
            className="border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            value={formData.imageUrl}
            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
          />
          <textarea
            placeholder="Description"
            className="border p-2 rounded md:col-span-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Event
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{event.title}</h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm mb-2">{new Date(event.date).toLocaleString()}</p>
            <p className="text-gray-700 dark:text-slate-300 mb-2">{event.location}</p>
            <p className="text-gray-600 dark:text-slate-400 mb-4">{event.description}</p>
            <button
              onClick={() => handleDelete(event.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete Event
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;

import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../layouts/AdminLayout';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'normal' });
  const { showToast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
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
      setFormData({ title: '', content: '', priority: 'normal' });
      // Update local state immediately
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
      // Update local state immediately
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showToast('Error deleting announcement', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Announcements</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Title"
            className="border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <select
            className="border p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
          >
            <option value="low">Low Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="high">High Priority</option>
          </select>
          <textarea
            placeholder="Content"
            className="border p-2 rounded h-32 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Post Announcement
        </button>
      </form>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow border-l-4 ${
            announcement.priority === 'high' ? 'border-red-500' : 
            announcement.priority === 'low' ? 'border-green-500' : 'border-blue-500'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{announcement.title}</h3>
                <span className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold">{announcement.priority}</span>
                <p className="text-gray-600 dark:text-slate-300 mt-2">{announcement.content}</p>
                <p className="text-gray-400 text-xs mt-2">{new Date(announcement.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleDelete(announcement.id)}
                className="text-red-600 hover:text-red-800 self-end sm:self-start"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;

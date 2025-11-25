import React, { useState } from 'react';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Camera, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import UserLayout from '../layouts/UserLayout';
import { useToast } from '../context/ToastContext';

const ReportIssue = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure',
    location: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // Mock reverse geocoding for demo
        setFormData({ ...formData, location: `Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)} (Near Current Location)` });
        addToast('Location retrieved successfully', 'success');
      }, () => {
        addToast('Unable to retrieve your location', 'error');
      });
    } else {
      addToast('Geolocation is not supported by your browser', 'error');
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return addToast('Please login to report an issue', 'error');

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('location', formData.location);
    data.append('userId', user.id);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      await axiosInstance.post('/issues', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast('Issue reported successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error reporting issue:', error);
      const errorMessage = error.response?.data?.error || 'Failed to report issue. Please try again.';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden transition-colors duration-200">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Report an Issue</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                placeholder="e.g., Pothole on Main St"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                name="category"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="sanitation">Sanitation</option>
                <option value="electricity">Electricity</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="location"
                  required
                  className="flex-grow px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                  placeholder="e.g., 123 Main St, near the park"
                  value={formData.location}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={handleLocateMe}
                  className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center"
                  title="Use Current Location"
                >
                  <MapPin size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer relative bg-gray-50 dark:bg-slate-900/50">
                <div className="space-y-1 text-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="mx-auto h-48 object-cover rounded-lg" />
                  ) : (
                    <Camera className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  )}
                  <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="file-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default ReportIssue;

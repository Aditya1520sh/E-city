import React, { useState } from 'react';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Camera, Loader, AlertCircle, CheckCircle, FileText, MessageSquare } from 'lucide-react';
import UserLayout from '../layouts/UserLayout';
import { useToast } from '../context/ToastContext';

const ReportIssue = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure',
    location: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'title':
        if (!value.trim()) {
          error = 'Title is required';
        } else if (value.length < 10) {
          error = `Title must be at least 10 characters (${value.length}/10)`;
        } else if (value.length > 100) {
          error = `Title must be less than 100 characters (${value.length}/100)`;
        }
        break;
      
      case 'description':
        if (!value.trim()) {
          error = 'Description is required';
        } else if (value.length < 20) {
          error = `Description must be at least 20 characters (${value.length}/20)`;
        } else if (value.length > 500) {
          error = `Description must be less than 500 characters (${value.length}/500)`;
        }
        break;
      
      case 'location':
        if (!value.trim()) {
          error = 'Location is required';
        } else if (value.length < 5) {
          error = `Location must be at least 5 characters (${value.length}/5)`;
        }
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'image') {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB
          setErrors({ ...errors, image: 'Image size must be less than 10MB' });
          return;
        }
        setFormData({ ...formData, image: file });
        setPreview(URL.createObjectURL(file));
        setErrors({ ...errors, image: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Real-time validation
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // Mock reverse geocoding for demo
        setFormData({ ...formData, location: `Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)} (Near Current Location)` });
        showToast('Location retrieved successfully', 'success');
      }, () => {
        showToast('Unable to retrieve your location', 'error');
      });
    } else {
      showToast('Geolocation is not supported by your browser', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return showToast('Please login to report an issue', 'error');

    // Validate all fields before submission
    const newErrors = {
      title: validateField('title', formData.title),
      description: validateField('description', formData.description),
      location: validateField('location', formData.location),
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      showToast('Please fix all errors before submitting', 'error');
      return;
    }

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
      showToast('Issue reported successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error reporting issue:', error);
      const errorMessage = error.response?.data?.error || 'Failed to report issue. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Report an Issue</h1>
          <p className="text-blue-100">Help us improve the city by reporting problems you encounter</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FileText size={18} />
                  Title
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 ${
                    errors.title 
                      ? 'border-red-500 focus:ring-red-200 dark:border-red-500' 
                      : formData.title.length >= 10
                      ? 'border-green-500 focus:ring-green-200 dark:border-green-500'
                      : 'border-gray-300 dark:border-slate-600 focus:ring-blue-200'
                  }`}
                  placeholder="e.g., Broken streetlight on Main Street"
                  value={formData.title}
                  onChange={handleChange}
                />
                <div className="mt-2 flex items-start justify-between">
                  {errors.title ? (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.title}</span>
                    </div>
                  ) : formData.title.length >= 10 ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle size={16} />
                      <span>Title looks good!</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Provide a clear, descriptive title
                    </span>
                  )}
                  <span className={`text-sm font-medium ${
                    formData.title.length > 100 
                      ? 'text-red-600 dark:text-red-400' 
                      : formData.title.length >= 10
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formData.title.length}/100
                  </span>
                </div>
              </div>

              {/* Category Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="category"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-200 focus:outline-none dark:bg-slate-700 dark:text-white transition-all"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="infrastructure">🏗️ Infrastructure</option>
                  <option value="sanitation">🗑️ Sanitation</option>
                  <option value="electricity">⚡ Electricity</option>
                  <option value="water">💧 Water Supply</option>
                  <option value="roads">🛣️ Roads</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>

              {/* Location Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin size={18} />
                  Location
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <input
                      type="text"
                      name="location"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 ${
                        errors.location 
                          ? 'border-red-500 focus:ring-red-200 dark:border-red-500' 
                          : formData.location.length >= 5
                          ? 'border-green-500 focus:ring-green-200 dark:border-green-500'
                          : 'border-gray-300 dark:border-slate-600 focus:ring-blue-200'
                      }`}
                      placeholder="e.g., 123 Main St, near the park"
                      value={formData.location}
                      onChange={handleChange}
                    />
                    {errors.location && (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm mt-1">
                        <AlertCircle size={16} />
                        <span>{errors.location}</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    className="bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-xl hover:bg-blue-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2 font-medium"
                    title="Use Current Location"
                  >
                    <MapPin size={20} />
                    <span className="hidden sm:inline">Locate</span>
                  </button>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Camera size={18} />
                  Upload Image (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer relative bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900/50 dark:to-slate-800/50 border-gray-300 dark:border-slate-600">
                  <div className="space-y-2 text-center">
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Preview" className="mx-auto h-48 object-cover rounded-xl shadow-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setPreview(null);
                            setFormData({ ...formData, image: null });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input id="file-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleChange} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                {errors.image && (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm mt-2">
                    <AlertCircle size={16} />
                    <span>{errors.image}</span>
                  </div>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MessageSquare size={18} />
                  Description
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows="5"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 resize-none ${
                    errors.description 
                      ? 'border-red-500 focus:ring-red-200 dark:border-red-500' 
                      : formData.description.length >= 20
                      ? 'border-green-500 focus:ring-green-200 dark:border-green-500'
                      : 'border-gray-300 dark:border-slate-600 focus:ring-blue-200'
                  }`}
                  placeholder="Provide detailed information about the issue, including when it started, how severe it is, and any other relevant details..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
                <div className="mt-2 flex items-start justify-between">
                  {errors.description ? (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.description}</span>
                    </div>
                  ) : formData.description.length >= 20 ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle size={16} />
                      <span>Description is detailed!</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Provide detailed information
                    </span>
                  )}
                  <span className={`text-sm font-medium ${
                    formData.description.length > 500 
                      ? 'text-red-600 dark:text-red-400' 
                      : formData.description.length >= 20
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formData.description.length}/500
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || Object.values(errors).some(error => error !== '')}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                  loading || Object.values(errors).some(error => error !== '') ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Submitting Report...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ReportIssue;

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Pencil, Trash2, MapPin, Mail, User, Phone,
  ChevronDown, ChevronUp, ExternalLink, Upload, X,
  Hammer, Heart, GraduationCap, Droplet, Zap, Bus, Leaf
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { useToast } from '../context/ToastContext';

// Predefined department configurations
const departmentConfig = {
  'Public Works Department': { gradient: 'from-orange-500 via-red-500 to-pink-500', icon: Hammer },
  'Health Department': { gradient: 'from-emerald-500 via-green-500 to-teal-500', icon: Heart },
  'Education Department': { gradient: 'from-blue-500 via-indigo-500 to-purple-500', icon: GraduationCap },
  'Water Supply Board': { gradient: 'from-cyan-500 via-blue-500 to-indigo-500', icon: Droplet },
  'Electricity Department': { gradient: 'from-yellow-400 via-orange-400 to-red-400', icon: Zap },
  'Transportation Department': { gradient: 'from-purple-500 via-pink-500 to-rose-500', icon: Bus },
  'Environmental Services': { gradient: 'from-lime-500 via-green-500 to-emerald-500', icon: Leaf }
};

// Icon pool for custom departments - automatically assigned based on name
const iconPool = [
  { gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', icon: Building2 },
  { gradient: 'from-rose-500 via-pink-500 to-red-500', icon: Building2 },
  { gradient: 'from-amber-500 via-yellow-500 to-orange-500', icon: Building2 },
  { gradient: 'from-teal-500 via-cyan-500 to-sky-500', icon: Building2 },
  { gradient: 'from-indigo-500 via-blue-500 to-cyan-500', icon: Building2 },
  { gradient: 'from-green-500 via-emerald-500 to-teal-500', icon: Building2 },
  { gradient: 'from-pink-500 via-rose-500 to-red-500', icon: Building2 },
  { gradient: 'from-slate-500 via-gray-500 to-zinc-500', icon: Building2 }
];

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const location = useLocation();
  
  // Action modal state (assign/escalate)
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', department: null });
  const [departmentIssues, setDepartmentIssues] = useState([]);

  // Parse query params for deep-link actions
  const query = new URLSearchParams(location.search);
  const deepLinkDept = query.get('dept') || '';
  const deepLinkAction = query.get('action') || '';

  const [formData, setFormData] = useState({
    name: '', head: '', contact: '', email: '', location: '', description: '', imageUrl: ''
  });

  useEffect(() => { fetchDepartments(); }, []);

  // When departments load, apply deep link: highlight/open modal or filter
  useEffect(() => {
    if (!loading && departments.length > 0 && deepLinkDept) {
      const match = departments.find(d => (d.name || '').toLowerCase() === deepLinkDept.toLowerCase());
      if (match) {
        // Expand the matched card
        setExpandedCards(prev => new Set([...prev, match.id]));
        // Handle action
        if (deepLinkAction === 'assign' || deepLinkAction === 'escalate') {
          // Open action modal (not edit modal)
          openActionModal(deepLinkAction, match);
          showToast(`Opened ${deepLinkAction} panel for ${match.name}`, 'info');
        } else {
          // Soft scroll to the card
          const el = document.getElementById(`dept-card-${match.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, departments, deepLinkDept, deepLinkAction]);

  // Fetch issues for action modal
  const fetchDepartmentIssues = async (deptName) => {
    try {
      const response = await axiosInstance.get('/issues');
      // Filter issues by department or category mapping, exclude closed issues
      const filtered = response.data.filter(issue => {
        const matchesDept = issue.assignedDepartment === deptName || 
          (issue.category && getCategoryDepartment(issue.category) === deptName);
        const isOpen = issue.status !== 'resolved' && issue.status !== 'rejected';
        return matchesDept && isOpen;
      });
      setDepartmentIssues(filtered);
    } catch (error) {
      console.error('Error fetching department issues:', error);
      setDepartmentIssues([]);
    }
  };

  const getCategoryDepartment = (category) => {
    const map = {
      'infrastructure': 'Public Works',
      'sanitation': 'Sanitation',
      'electricity': 'Electricity',
      'water': 'Water Supply',
      'roads': 'Roads & Highways',
      'other': 'General Services'
    };
    return map[category] || category;
  };

  const openActionModal = async (type, dept) => {
    setActionModal({ isOpen: true, type, department: dept });
    await fetchDepartmentIssues(dept.name);
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, type: '', department: null });
    setDepartmentIssues([]);
  };

  const fetchDepartments = async () => {
    console.log('fetchDepartments called');
    try {
      const response = await axiosInstance.get('/departments');
      console.log('fetchDepartments response:', response.data);
      console.log('Number of departments:', response.data.length);
      setDepartments(response.data);
      console.log('Departments state updated');
    } catch (error) {
      console.error('Error fetching departments:', error);
      showToast('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData({ ...formData, imageUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingDept ? `/departments/${editingDept.id}` : '/departments';
      const method = editingDept ? 'put' : 'post';
      await axiosInstance[method](url, formData);
      showToast(`Department ${editingDept ? 'updated' : 'created'} successfully`, 'success');
      fetchDepartments();
      closeModal();
    } catch (error) {
      console.error('Error saving department:', error);
      showToast('Failed to save department', 'error');
    }
  };


  const handleDelete = async (id) => {
    console.log('Delete clicked for ID:', id);
    if (!window.confirm('Are you sure you want to delete this department?')) {
      console.log('Delete cancelled by user');
      return;
    }
    try {
      console.log('Calling delete API for ID:', id);
      await axiosInstance.delete(`/departments/${id}`);
      console.log('Delete API successful, calling showToast');
      showToast('Department deleted successfully', 'success');
      console.log('Calling fetchDepartments to refresh list');
      await fetchDepartments();
      console.log('fetchDepartments completed');
    } catch (error) {
      console.error('Error deleting department:', error);
      showToast('Failed to delete department', 'error');
    }
  };

  const openModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, head: dept.head || '', contact: dept.contact || '', email: dept.email || '', location: dept.location || '', description: dept.description || '', imageUrl: dept.imageUrl || '' });
      setImagePreview(dept.imageUrl || null);
    } else {
      setEditingDept(null);
      setFormData({ name: '', head: '', contact: '', email: '', location: '', description: '', imageUrl: '' });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setFormData({ name: '', head: '', contact: '', email: '', location: '', description: '', imageUrl: '' });
    setImagePreview(null);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: '' });
  };

  const toggleExpand = (id) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const getConfig = (name) => {
    // Return predefined config if it exists
    if (departmentConfig[name]) return departmentConfig[name];
    // For custom departments, assign an icon from the pool based on name hash
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const iconIndex = hash % iconPool.length;
    return iconPool[iconIndex];
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Departments</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage city departments with modern interface • {departments.length} Active Departments</p>
          </div>
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 font-medium">
            <Plus className="w-5 h-5" />Add Department
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-purple-600 absolute top-0"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => {
              const config = getConfig(dept.name);
              const IconComponent = config.icon;
              const isExpanded = expandedCards.has(dept.id);

              return (
                <motion.div id={`dept-card-${dept.id}`} key={dept.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.5 }} whileHover={{ y: -8, transition: { duration: 0.3 } }} className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${ (dept.name || '').toLowerCase() === deepLinkDept.toLowerCase() ? 'border-blue-400 dark:border-blue-500' : 'border-gray-100 dark:border-gray-700' }`}>
                  <div className="relative h-48 overflow-hidden">
                    {dept.imageUrl ? (
                      <>
                        <motion.img whileHover={{ scale: 1.1 }} transition={{ duration: 0.6 }} src={dept.imageUrl} alt={dept.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      </>
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${config.gradient} relative`}>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                        <div className="absolute inset-0 backdrop-blur-[1px] bg-black/10"></div>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(dept)} className="p-2.5 bg-white/90 backdrop-blur-md rounded-lg hover:bg-white transition-colors shadow-lg">
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(dept.id)} className="p-2.5 bg-white/90 backdrop-blur-md rounded-lg hover:bg-white transition-colors shadow-lg">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </motion.button>
                    </div>

                    <div className="absolute -bottom-6 left-6">
                      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} className={`p-4 bg-gradient-to-br ${config.gradient} rounded-2xl shadow-xl border-4 border-white dark:border-gray-800`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="p-6 pt-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-1">{dept.name}</h3>
                    <div className="space-y-3 text-sm">
                      {dept.head && (
                        <motion.div whileHover={{ x: 4 }} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} bg-opacity-10`}><User className="w-4 h-4" style={{ color: 'currentColor' }} /></div>
                          <span className="font-medium">{dept.head}</span>
                        </motion.div>
                      )}
                      {dept.contact && (
                        <motion.a whileHover={{ x: 4 }} href={`tel:${dept.contact}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/link">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover/link:bg-blue-100 dark:group-hover/link:bg-blue-900/30 transition-colors"><Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                          <span>{dept.contact}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity ml-auto" />
                        </motion.a>
                      )}
                      {dept.email && (
                        <motion.a whileHover={{ x: 4 }} href={`mailto:${dept.email}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/link">
                          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 group-hover/link:bg-purple-100 dark:group-hover/link:bg-purple-900/30 transition-colors"><Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
                          <span className="truncate flex-1">{dept.email}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </motion.a>
                      )}
                      {dept.location && (
                        <motion.div whileHover={{ x: 4 }} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 mt-0"><MapPin className="w-4 h-4 text-green-600 dark:text-green-400" /></div>
                          <span className={isExpanded ? '' : 'line-clamp-2'}>{dept.location}</span>
                        </motion.div>
                      )}
                    </div>

                    {dept.description && (
                      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                        <AnimatePresence mode="wait">
                          <motion.p key={isExpanded ? 'expanded' : 'collapsed'} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className={`text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {dept.description}
                          </motion.p>
                        </AnimatePresence>
                        <motion.button whileHover={{ x: 2 }} onClick={() => toggleExpand(dept.id)} className="flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                          {isExpanded ? (<>Show Less <ChevronUp className="w-3.5 h-3.5" /></>) : (<>Show More <ChevronDown className="w-3.5 h-3.5" /></>)}
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50" onClick={closeModal} />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', duration: 0.5 }} className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                  <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{editingDept ? 'Edit Department' : 'Add New Department'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{editingDept ? 'Update department information' : 'Create a new department with details'}</p>
                  </div>

                  <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Department Image</label>
                        {imagePreview ? (
                          <div className="relative group">
                            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600" />
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={removeImage} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-4 h-4" />
                            </motion.button>
                          </div>
                        ) : (
                          <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</p>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} className="hidden" />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Department Name <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all" placeholder="e.g., Public Works Department" />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Head of Department</label>
                        <input type="text" value={formData.head} onChange={(e) => setFormData({ ...formData, head: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all" placeholder="e.g., John Doe" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all" placeholder="dept@ecity.gov.in" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Number</label>
                          <input type="text" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all" placeholder="011-23456789" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                        <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all" placeholder="e.g., Civil Lines, Block A" />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all resize-none" placeholder="Brief description of department responsibilities..." />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end border-t border-gray-100 dark:border-gray-700">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={closeModal} className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Cancel</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all">{editingDept ? 'Save Changes' : 'Create Department'}</motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Action Modal (Assign/Escalate) */}
        <AnimatePresence>
          {actionModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50" onClick={closeActionModal} />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', duration: 0.5 }} className="relative z-10 w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {actionModal.type === 'assign' ? 'Assign Open Issues' : 'Escalate Open Issues'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {actionModal.department?.name} • {departmentIssues.length} open issue(s)
                      </p>
                    </div>
                    <button onClick={closeActionModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                  {departmentIssues.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No open issues found for this department</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Resolved and rejected issues are not shown</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {departmentIssues.map((issue) => (
                        <div key={issue.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{issue.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{issue.description?.substring(0, 100)}...</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  issue.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' :
                                  issue.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
                                  issue.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                }`}>
                                  {issue.status}
                                </span>
                                <span className="text-xs text-gray-500">{issue.category}</span>
                                <span className="text-xs text-gray-500">{issue.location}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {actionModal.type === 'assign' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await axiosInstance.put(`/issues/${issue.id}`, {
                                        ...issue,
                                        assignedDepartment: actionModal.department?.name,
                                        status: issue.status === 'pending' ? 'in-progress' : issue.status
                                      });
                                      showToast(`Assigned issue to ${actionModal.department?.name}`, 'success');
                                      fetchDepartmentIssues(actionModal.department?.name); // Refresh list
                                    } catch (error) {
                                      console.error('Error assigning issue:', error);
                                      showToast('Failed to assign issue', 'error');
                                    }
                                  }}
                                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Assign
                                </button>
                              )}
                              {actionModal.type === 'escalate' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await axiosInstance.put(`/issues/${issue.id}`, {
                                        ...issue,
                                        priority: 'high',
                                        status: 'in-progress',
                                        escalatedAt: new Date().toISOString()
                                      });
                                      showToast(`Escalated issue for ${actionModal.department?.name}`, 'warning');
                                      fetchDepartmentIssues(actionModal.department?.name); // Refresh list
                                    } catch (error) {
                                      console.error('Error escalating issue:', error);
                                      showToast('Failed to escalate issue', 'error');
                                    }
                                  }}
                                  className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                  Escalate
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={closeActionModal} className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { Search, Filter, Download, Eye, Trash2, MapPin, Calendar, User, MessageSquare, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { useToast } from '../context/ToastContext';

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  const [statusForm, setStatusForm] = useState({
    // In-Progress fields
    assignedOfficer: '',
    assignedDepartment: '',
    estimatedCompletion: '',
    actionTaken: '',
    progressUpdate: '',
    
    // Resolution fields
    resolutionTime: '',
    resolutionRemarks: '',
    resolutionOfficer: '',
    costIncurred: '',
    resourcesUsed: '',
    
    // Rejection fields
    rejectionReason: '',
    alternativeSuggestion: ''
  });
  const { addToast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const ROOT_BASE = API_BASE.replace(/\/api$/, '');
  useEffect(() => {
    fetchIssues();
    fetchDepartments();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axiosInstance.get('/issues');
      setIssues(res.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      addToast('Failed to load issues', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const updateStatus = async (id, status, extraData = {}) => {
    try {
      await axiosInstance.patch(`/issues/${id}/status`, { status, ...extraData });
      setIssues(issues.map(i => i.id === id ? { ...i, status, ...extraData } : i));
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue({ ...selectedIssue, status, ...extraData });
      }
      addToast(`Status updated to ${status}`, 'success');
      setShowStatusModal(false);
      setStatusForm({
        assignedOfficer: '',
        assignedDepartment: '',
        estimatedCompletion: '',
        actionTaken: '',
        progressUpdate: '',
        resolutionTime: '',
        resolutionRemarks: '',
        resolutionOfficer: '',
        costIncurred: '',
        resourcesUsed: '',
        rejectionReason: '',
        alternativeSuggestion: ''
      });
    } catch (error) {
      addToast('Error updating status', 'error');
    }
  };

  const handleDepartmentChange = (deptName) => {
    const dept = departments.find(d => d.name === deptName);
    setStatusForm({
      ...statusForm,
      assignedDepartment: deptName,
      assignedOfficer: dept?.head || ''
    });
  };

  const handleStatusClick = (status) => {
    setStatusAction(status);
    
    if (status === 'in-progress') {
      setStatusForm({
        assignedOfficer: '',
        assignedDepartment: '',
        estimatedCompletion: new Date().toISOString().slice(0, 16),
        actionTaken: '',
        progressUpdate: ''
      });
      setShowStatusModal(true);
    } else if (status === 'resolved') {
      setStatusForm({
        resolutionTime: new Date().toISOString().slice(0, 16),
        resolutionRemarks: '',
        resolutionOfficer: '',
        costIncurred: '',
        resourcesUsed: ''
      });
      setShowStatusModal(true);
    } else if (status === 'rejected') {
      setStatusForm({
        rejectionReason: '',
        alternativeSuggestion: ''
      });
      setShowStatusModal(true);
    } else {
      updateStatus(selectedIssue.id, status);
    }
  };

  const submitStatusChange = (e) => {
    e.preventDefault();
    
    // Validate required fields based on status
    if (statusAction === 'in-progress') {
      if (!statusForm.assignedOfficer || !statusForm.assignedDepartment || !statusForm.actionTaken) {
        addToast('Please fill all required fields: Assigned Officer, Department, and Action Taken', 'error');
        return;
      }
    } else if (statusAction === 'resolved') {
      if (!statusForm.resolutionOfficer || !statusForm.resolutionRemarks) {
        addToast('Please fill all required fields: Resolution Officer and Remarks', 'error');
        return;
      }
    } else if (statusAction === 'rejected') {
      if (!statusForm.rejectionReason) {
        addToast('Please provide a rejection reason', 'error');
        return;
      }
    }
    
    updateStatus(selectedIssue.id, statusAction, statusForm);
  };

  const deleteIssue = async (id) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await axiosInstance.delete(`/issues/${id}`);
      setIssues(issues.filter(i => i.id !== id));
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue(null);
      }
      addToast('Issue deleted successfully', 'success');
    } catch (error) {
      addToast('Error deleting issue', 'error');
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Title,Description,Category,Status,Location,Reporter,Date,Upvotes,Resolution Officer,Resolution Time,Resolution Remarks\n"
      + issues.map(e => `${e.id},"${e.title}","${e.description}",${e.category},${e.status},"${e.location}","${e.user?.name || 'Anonymous'}",${new Date(e.createdAt).toLocaleDateString()},${e.upvotes},"${e.resolutionOfficer || ''}","${e.resolutionTime || ''}","${e.resolutionRemarks || ''}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "detailed_issues_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = filter === 'all' || issue.status === filter;
    const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) || 
                          issue.description.toLowerCase().includes(search.toLowerCase()) ||
                          issue.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 dark:text-white">Loading...</div>;

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Issue Reports</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and track all reported issues in detail.</p>
          </div>
          <button 
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          >
            <Download size={18} className="mr-2" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Issues List */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'pending', 'in-progress', 'resolved', 'rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                      filter === f 
                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {filteredIssues.map(issue => (
                <div 
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border ${
                    selectedIssue?.id === issue.id
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-sm'
                      : 'bg-white border-transparent hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 mb-1">{issue.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{issue.description}</p>
                </div>
              ))}
              {filteredIssues.length === 0 && (
                <div className="text-center py-8 text-slate-400">No issues found</div>
              )}
            </div>
          </div>

          {/* Issue Details */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            {selectedIssue ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedIssue.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(selectedIssue.status)}`}>
                        {selectedIssue.status}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm space-x-4">
                      <span className="flex items-center"><MapPin size={16} className="mr-1" /> {selectedIssue.location}</span>
                      <span className="flex items-center"><Calendar size={16} className="mr-1" /> {new Date(selectedIssue.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => deleteIssue(selectedIssue.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Issue"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {selectedIssue.status === 'in-progress' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-100 dark:border-blue-800">
                      <h4 className="text-blue-800 dark:text-blue-300 font-bold mb-2 flex items-center">
                        <AlertTriangle size={18} className="mr-2" /> In Progress Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700/70 dark:text-blue-400 block text-xs uppercase font-bold">Assigned Officer</span>
                          <span className="text-blue-900 dark:text-blue-100">{selectedIssue.assignedOfficer || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-blue-700/70 dark:text-blue-400 block text-xs uppercase font-bold">Department</span>
                          <span className="text-blue-900 dark:text-blue-100">{selectedIssue.assignedDepartment || 'N/A'}</span>
                        </div>
                        {selectedIssue.estimatedCompletion && (
                          <div>
                            <span className="text-blue-700/70 dark:text-blue-400 block text-xs uppercase font-bold">Est. Completion</span>
                            <span className="text-blue-900 dark:text-blue-100">{new Date(selectedIssue.estimatedCompletion).toLocaleString()}</span>
                          </div>
                        )}
                        {selectedIssue.actionTaken && (
                          <div className="col-span-2">
                            <span className="text-blue-700/70 dark:text-blue-400 block text-xs uppercase font-bold">Action Taken</span>
                            <span className="text-blue-900 dark:text-blue-100">{selectedIssue.actionTaken}</span>
                          </div>
                        )}
                        {selectedIssue.progressUpdate && (
                          <div className="col-span-2">
                            <span className="text-blue-700/70 dark:text-blue-400 block text-xs uppercase font-bold">Progress Update</span>
                            <span className="text-blue-900 dark:text-blue-100">{selectedIssue.progressUpdate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedIssue.status === 'resolved' && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6 border border-green-100 dark:border-green-800">
                      <h4 className="text-green-800 dark:text-green-300 font-bold mb-2 flex items-center">
                        <CheckCircle size={18} className="mr-2" /> Resolution Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700/70 dark:text-green-400 block text-xs uppercase font-bold">Officer</span>
                          <span className="text-green-900 dark:text-green-100">{selectedIssue.resolutionOfficer || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-green-700/70 dark:text-green-400 block text-xs uppercase font-bold">Time</span>
                          <span className="text-green-900 dark:text-green-100">{selectedIssue.resolutionTime ? new Date(selectedIssue.resolutionTime).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-green-700/70 dark:text-green-400 block text-xs uppercase font-bold">Remarks</span>
                          <span className="text-green-900 dark:text-green-100">{selectedIssue.resolutionRemarks || 'No remarks'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedIssue.description}
                      </p>
                    </div>
                    <div>
                      {selectedIssue.imageUrl && (
                        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                          <img 
                            src={`${ROOT_BASE}${selectedIssue.imageUrl}`} 
                            alt="Issue evidence" 
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center text-slate-500 dark:text-slate-400 mb-1">
                        <User size={16} className="mr-2" />
                        <span className="text-xs font-bold uppercase">Reported By</span>
                      </div>
                      <p className="font-medium text-slate-800 dark:text-white">{selectedIssue.user?.name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">{selectedIssue.user?.email}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center text-slate-500 dark:text-slate-400 mb-1">
                        <AlertTriangle size={16} className="mr-2" />
                        <span className="text-xs font-bold uppercase">Category</span>
                      </div>
                      <p className="font-medium text-slate-800 dark:text-white capitalize">{selectedIssue.category}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center text-slate-500 dark:text-slate-400 mb-1">
                        <MessageSquare size={16} className="mr-2" />
                        <span className="text-xs font-bold uppercase">Community</span>
                      </div>
                      <p className="font-medium text-slate-800 dark:text-white">{selectedIssue.upvotes} Upvotes</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Update Status</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => handleStatusClick('pending')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                          selectedIssue.status === 'pending'
                            ? 'bg-amber-500 text-white ring-2 ring-amber-600 ring-offset-2 shadow-lg'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleStatusClick('in-progress')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                          selectedIssue.status === 'in-progress'
                            ? 'bg-blue-500 text-white ring-2 ring-blue-600 ring-offset-2 shadow-lg'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleStatusClick('resolved')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                          selectedIssue.status === 'resolved'
                            ? 'bg-green-500 text-white ring-2 ring-green-600 ring-offset-2 shadow-lg'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-green-50'
                        }`}
                      >
                        Resolved
                      </button>
                      <button
                        onClick={() => handleStatusClick('rejected')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                          selectedIssue.status === 'rejected'
                            ? 'bg-red-500 text-white ring-2 ring-red-600 ring-offset-2 shadow-lg'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-red-50'
                        }`}
                      >
                        Rejected
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="bg-slate-100 dark:bg-slate-700 p-6 rounded-full mb-4">
                  <Search size={48} className="opacity-50" />
                </div>
                <p className="text-lg font-medium">Select an issue to view details</p>
                <p className="text-sm">Click on any issue from the list on the left</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
                {statusAction === 'in-progress' && 'Mark as In Progress'}
                {statusAction === 'resolved' && 'Mark as Resolved'}
                {statusAction === 'rejected' && 'Reject Issue'}
              </h3>
              
              <form onSubmit={submitStatusChange} className="space-y-4">
                {/* In Progress Form */}
                {statusAction === 'in-progress' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Assigned Officer <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Officer name"
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={statusForm.assignedOfficer}
                        onChange={e => setStatusForm({...statusForm, assignedOfficer: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Assigned Department <span className="text-red-500">*</span>
                      </label>
                      <select 
                        required
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={statusForm.assignedDepartment}
                        onChange={e => handleDepartmentChange(e.target.value)}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Assigned Officer <span className="text-red-500">*</span>
                        {statusForm.assignedOfficer && <span className="text-green-600 text-xs ml-2">(Auto-assigned from department)</span>}
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Officer name (auto-filled from department)"
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={statusForm.assignedOfficer}
                        onChange={e => setStatusForm({...statusForm, assignedOfficer: e.target.value})}
                      />
                      <p className="text-xs text-slate-500 mt-1">Auto-assigned when department is selected. You can edit if needed.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Estimated Completion Date
                      </label>
                      <input 
                        type="datetime-local" 
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={statusForm.estimatedCompletion}
                        onChange={e => setStatusForm({...statusForm, estimatedCompletion: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Action Taken <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        required
                        placeholder="Describe the actions being taken..."
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white h-24"
                        value={statusForm.actionTaken}
                        onChange={e => setStatusForm({...statusForm, actionTaken: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Progress Update
                      </label>
                      <textarea 
                        placeholder="Current progress notes..."
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white h-20"
                        value={statusForm.progressUpdate}
                        onChange={e => setStatusForm({...statusForm, progressUpdate: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {/* Resolved Form */}
                {statusAction === 'resolved' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Completion Time <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="datetime-local" 
                        required
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={statusForm.resolutionTime}
                        onChange={e => setStatusForm({...statusForm, resolutionTime: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Resolution Officer <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Officer in charge"
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={statusForm.resolutionOfficer}
                        onChange={e => setStatusForm({...statusForm, resolutionOfficer: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Resolution Remarks <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        required
                        placeholder="How was the issue resolved..."
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white h-24"
                        value={statusForm.resolutionRemarks}
                        onChange={e => setStatusForm({...statusForm, resolutionRemarks: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Cost Incurred (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={statusForm.costIncurred}
                        onChange={e => setStatusForm({...statusForm, costIncurred: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Resources Used
                      </label>
                      <textarea 
                        placeholder="Materials, manpower, equipment used..."
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white h-20"
                        value={statusForm.resourcesUsed}
                        onChange={e => setStatusForm({...statusForm, resourcesUsed: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {/* Rejected Form */}
                {statusAction === 'rejected' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        required
                        placeholder="Why is this issue being rejected..."
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white h-24"
                        value={statusForm.rejectionReason}
                        onChange={e => setStatusForm({...statusForm, rejectionReason: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Alternative Suggestion
                      </label>
                      <textarea 
                        placeholder="What can the user do instead..."
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white h-20"
                        value={statusForm.alternativeSuggestion}
                        onChange={e => setStatusForm({...statusForm, alternativeSuggestion: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t dark:border-slate-700">
                  <button 
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ${
                      statusAction === 'resolved' ? 'bg-green-600 hover:bg-green-700' :
                      statusAction === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {statusAction === 'in-progress' && 'Mark In Progress'}
                    {statusAction === 'resolved' && 'Mark as Resolved'}
                    {statusAction === 'rejected' && 'Reject Issue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminIssues;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, List, Users, Settings, LogOut, Shield, Sun, Moon, Map, Calendar, Megaphone, Menu, ChevronLeft, Building2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex transition-colors duration-200">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-6 z-40 p-1.5 rounded-lg bg-slate-900 dark:bg-slate-950 shadow-sm border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 ${isSidebarOpen ? 'left-[230px]' : 'left-6'}`}
        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-slate-900 dark:bg-slate-950 text-white fixed h-full transition-all duration-300 z-40 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Shield className="text-blue-500" size={28} />
            <span className="text-xl font-bold">CityAdmin</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]">
          <Link 
            to="/admin" 
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link 
            to="/admin/issues" 
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/issues') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <List size={20} />
            <span className="font-medium">Issues</span>
          </Link>
          <Link 
            to="/admin/users" 
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/users') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={20} />
            <span className="font-medium">Citizens</span>
          </Link>
          <Link 
            to="/admin/departments" 
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/departments') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Building2 size={20} />
            <span className="font-medium">Departments</span>
          </Link>
          <Link 
            to="/admin/locations" 
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/locations') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Map size={20} />
            <span className="font-medium">City Map</span>
          </Link>
          <Link 
            to="/admin/events" 
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/events') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Calendar size={20} />
            <span className="font-medium">Events</span>
          </Link>
          <Link 
            to="/admin/announcements" 
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/announcements') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Megaphone size={20} />
            <span className="font-medium">Announcements</span>
          </Link>
          <Link 
            to="/admin/settings" 
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive('/admin/settings') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 space-y-2 bg-slate-900 dark:bg-slate-950">
          <button 
            onClick={toggleTheme}
            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white w-full rounded-lg transition-all duration-200 font-medium"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/30 hover:text-red-300 w-full rounded-lg transition-all duration-200 font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

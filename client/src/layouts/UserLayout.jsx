import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, AlertTriangle, User, LogOut, Building2, MapPin, Moon, Sun, FileText, Map, Calendar, Megaphone, HelpCircle, BarChart2, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const UserLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLinks = () => (
    <>
      <Link
        to="/dashboard"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/dashboard') ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white font-medium'}`}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/events"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/events') ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white font-medium'}`}
      >
        <Calendar size={20} />
        <span>Events</span>
      </Link>
      <Link
        to="/announcements"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/announcements') ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white font-medium'}`}
      >
        <Megaphone size={20} />
        <span>Announcements</span>
      </Link>
      <Link
        to="/report"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/report') ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white font-medium'}`}
      >
        <AlertTriangle size={20} />
        <span>Report Issue</span>
      </Link>
      <Link
        to="/map"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/map') ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white font-medium'}`}
      >
        <Map size={20} />
        <span>City Map</span>
      </Link>
      <Link
        to="/help"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/help') ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white font-medium'}`}
      >
        <HelpCircle size={20} />
        <span>Help & Support</span>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex transition-colors duration-200">
      {/* Sidebar Toggle Button (Desktop) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-6 z-30 p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hidden md:flex items-center justify-center transition-all duration-300 ${isSidebarOpen ? 'left-[230px]' : 'left-6'}`}
        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={20} />}
      </button>

      {/* Sidebar (Desktop) */}
      <aside className={`fixed h-full z-20 hidden md:block bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <Link to="/" className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
            <Building2 size={28} />
            <span className="text-xl font-bold text-gray-800 dark:text-white">E-City</span>
          </Link>
        </div>

        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name || 'Citizen'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Resident</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <NavLinks />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-slate-700 space-y-2 bg-white dark:bg-slate-800">
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white w-full rounded-xl transition-all duration-200 font-medium"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 w-full rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-30 px-4 py-3 flex justify-between items-center safe-area-inset">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-500 dark:text-gray-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-target active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <Building2 size={22} />
            <span className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">E-City</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={toggleTheme}
            className="text-gray-500 dark:text-gray-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-target active:scale-95 transition-all"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[35] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-white dark:bg-slate-800 z-[40] transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl safe-area-inset`}>
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-500 dark:text-gray-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-target active:scale-95"
            aria-label="Close menu"
          >
            <ChevronLeft size={22} />
          </button>
        </div>
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{user?.name || 'Citizen'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Resident</p>
            </div>
          </div>
        </div>
        <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] scroll-smooth-ios">
          <NavLinks />
          <div className="border-t border-gray-100 dark:border-slate-700 my-3 sm:my-4"></div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full rounded-xl transition-colors touch-target active:scale-95"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className={`flex-1 p-4 sm:p-6 lg:p-8 mt-14 md:mt-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {children}
      </main>
    </div>
  );
};

export default UserLayout;

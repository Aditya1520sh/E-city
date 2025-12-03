import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, AlertTriangle, LayoutDashboard, LogIn, LogOut, Shield, Sun, Moon, Menu, X, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`bg-blue-600 dark:bg-slate-900 text-white shadow-lg transition-all duration-300 relative z-50 ${isScrolled ? 'shadow-xl' : ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 safe-area-inset">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2 font-bold text-lg sm:text-xl touch-target">
            <Building2 size={22} className="sm:w-6 sm:h-6" />
            <span>E-City</span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-blue-500 dark:hover:bg-slate-800 transition-colors touch-target active:scale-95"
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2.5 rounded-lg hover:bg-blue-500 dark:hover:bg-slate-800 transition-colors touch-target active:scale-95"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-blue-500 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                <Link to="/" className="hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium">Home</Link>

                {user.role === 'citizen' && (
                  <>
                    <Link to="/report" className="flex items-center space-x-1 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium">
                      <AlertTriangle size={16} />
                      <span>Report</span>
                    </Link>
                    <Link to="/dashboard" className="flex items-center space-x-1 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium">
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/events" className="flex items-center space-x-1 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium">
                      <Calendar size={16} />
                      <span>Events</span>
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center space-x-1 bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                    <Shield size={16} />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Improved touch targets and animations */}
      <div
        className={`md:hidden bg-blue-700 dark:bg-slate-800 px-4 pt-2 pb-4 space-y-1 shadow-xl absolute w-full left-0 top-14 sm:top-16 transition-all duration-300 ease-in-out transform ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
      >
        {user ? (
          <>
            <Link to="/" onClick={toggleMenu} className="block hover:bg-blue-600 dark:hover:bg-slate-700 px-4 py-3 rounded-lg text-base font-medium active:bg-blue-800 transition-colors touch-target">Home</Link>

            {user.role === 'citizen' && (
              <>
                <Link to="/report" onClick={toggleMenu} className="flex items-center space-x-3 hover:bg-blue-600 dark:hover:bg-slate-700 px-4 py-3 rounded-lg text-base font-medium active:bg-blue-800 transition-colors touch-target">
                  <AlertTriangle size={20} />
                  <span>Report Issue</span>
                </Link>
                <Link to="/dashboard" onClick={toggleMenu} className="flex items-center space-x-3 hover:bg-blue-600 dark:hover:bg-slate-700 px-4 py-3 rounded-lg text-base font-medium active:bg-blue-800 transition-colors touch-target">
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/events" onClick={toggleMenu} className="flex items-center space-x-3 hover:bg-blue-600 dark:hover:bg-slate-700 px-4 py-3 rounded-lg text-base font-medium active:bg-blue-800 transition-colors touch-target">
                  <Calendar size={20} />
                  <span>Events</span>
                </Link>
              </>
            )}

            {user.role === 'admin' && (
              <Link to="/admin" onClick={toggleMenu} className="flex items-center space-x-3 bg-blue-800 hover:bg-blue-900 dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-3 rounded-lg text-base font-medium active:bg-blue-900 transition-colors touch-target">
                <Shield size={20} />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <div className="border-t border-blue-600 dark:border-slate-600 my-2"></div>

            <button
              onClick={() => { handleLogout(); toggleMenu(); }}
              className="w-full text-left flex items-center space-x-3 hover:bg-blue-600 dark:hover:bg-slate-700 px-4 py-3 rounded-lg text-base font-medium active:bg-blue-800 transition-colors touch-target"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" onClick={toggleMenu} className="flex items-center space-x-3 hover:bg-blue-600 dark:hover:bg-slate-700 px-4 py-3 rounded-lg text-base font-medium active:bg-blue-800 transition-colors touch-target">
            <LogIn size={20} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

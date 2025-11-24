import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, AlertTriangle, LayoutDashboard, LogIn, LogOut, Shield, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-blue-600 dark:bg-slate-900 text-white shadow-lg transition-colors duration-200 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
            <Building2 size={24} />
            <span>E-Delhi</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-blue-500 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleMenu} className="p-2">
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
                      <LayoutDashboard size={16} />
                      <span>Dashboard</span>
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

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 dark:bg-slate-800 px-4 pt-2 pb-4 space-y-2 shadow-lg absolute w-full left-0 top-16">
          {user ? (
            <>
              <Link to="/" onClick={toggleMenu} className="block hover:bg-blue-600 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">Home</Link>
              
              {user.role === 'citizen' && (
                <>
                  <Link to="/report" onClick={toggleMenu} className="flex items-center space-x-2 hover:bg-blue-600 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">
                    <AlertTriangle size={18} />
                    <span>Report Issue</span>
                  </Link>
                  <Link to="/dashboard" onClick={toggleMenu} className="flex items-center space-x-2 hover:bg-blue-600 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                </>
              )}
              
              {user.role === 'admin' && (
                <Link to="/admin" onClick={toggleMenu} className="flex items-center space-x-2 bg-blue-800 hover:bg-blue-900 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-2 rounded-md text-base font-medium">
                  <Shield size={18} />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <button 
                onClick={() => { handleLogout(); toggleMenu(); }}
                className="w-full text-left flex items-center space-x-2 hover:bg-blue-600 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" onClick={toggleMenu} className="flex items-center space-x-2 hover:bg-blue-600 dark:hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

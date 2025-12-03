import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store token and user
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Show success message
        showToast(`Welcome back, ${user.name}!`, 'success');

        // Redirect based on role
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 500);
      } catch (error) {
        console.error('Error processing Google login:', error);
        showToast('Failed to complete Google login', 'error');
        navigate('/login', { replace: true });
      }
    } else {
      showToast('Google login failed', 'error');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, showToast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-semibold">Completing Google Sign-In...</p>
        <p className="text-slate-400 text-sm mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

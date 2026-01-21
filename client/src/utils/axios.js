import axios from 'axios';

// Always route frontend requests through our server `/api`.
// The server will read its own `.env` and call external APIs.
// In development, use the backend server URL if different from frontend
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000/api' : `${window.location.origin}/api`);

// Create axios instance with base config
const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds (Render free tier cold start can take 50s+)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add retry logic for failed requests
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Don't retry if request was cancelled or no config
    if (!config || error.code === 'ECONNABORTED') {
      return Promise.reject(error);
    }

    // Set retry count
    config.__retryCount = config.__retryCount || 0;

    // Check if we should retry
    const shouldRetry = 
      config.__retryCount < 3 && // Max 3 retries
      error.response?.status >= 500 && // Only retry server errors
      error.response?.status !== 501; // Except "Not Implemented"

    if (shouldRetry) {
      config.__retryCount += 1;

      // Exponential backoff: 1s, 2s, 4s
      const backoffDelay = Math.pow(2, config.__retryCount - 1) * 1000;
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      
      return axiosInstance(config);
    }

    // Handle specific errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't redirect if it's a login attempt
      if (!config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_BASE };

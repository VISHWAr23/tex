import axios from 'axios';

/**
 * Axios instance for API calls
 * Configured with base URL, headers, and interceptors for authentication and error handling
 */
const axiosInstance = axios.create({
  baseURL: 'https://tex-server.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      const networkError = {
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true,
      };
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Handle authentication errors
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject({ message: 'Session expired. Please login again.' });
    }

    // Handle forbidden errors
    if (status === 403) {
      return Promise.reject({ message: 'You do not have permission to perform this action.' });
    }

    // Handle not found errors
    if (status === 404) {
      return Promise.reject({ message: data?.message || 'Resource not found.' });
    }

    // Handle validation errors
    if (status === 400) {
      const message = Array.isArray(data?.message) 
        ? data.message.join(', ') 
        : data?.message || 'Invalid request. Please check your input.';
      return Promise.reject({ message });
    }

    // Handle conflict errors (e.g., duplicate records)
    if (status === 409) {
      return Promise.reject({ message: data?.message || 'A record with this information already exists.' });
    }

    // Handle server errors
    if (status >= 500) {
      return Promise.reject({ message: 'Server error. Please try again later.' });
    }

    // Default error handling
    const message = data?.message || 'An unexpected error occurred.';
    return Promise.reject({ 
      message: Array.isArray(message) ? message.join(', ') : message 
    });
  }
);

export default axiosInstance;
import axios from 'axios';
import API_BASE_URL from '../config/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (import.meta.env.DEV) {
      console.log('API Request:', config.url, 'with token:', token.substring(0, 20) + '...');
    }
  } else if (import.meta.env.DEV) {
    console.warn('API Request without token:', config.url);
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login (except for auth endpoints)
      if (error.config?.url !== '/auth/login' && error.config?.url !== '/auth/google') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      if (import.meta.env.DEV) {
        console.error('401 Unauthorized - Token cleared and redirecting to login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;


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
    console.log('API Request:', config.url, 'with token:', token.substring(0, 20) + '...');
  } else {
    console.warn('API Request without token:', config.url);
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - Token issue:', {
        url: error.config?.url,
        token: localStorage.getItem('token') ? 'Token exists' : 'No token',
        tokenValue: localStorage.getItem('token')
      });
      // Optionally clear invalid token
      if (error.config?.url !== '/auth/login' && error.config?.url !== '/auth/google') {
        // Don't clear on auth endpoints
      }
    }
    return Promise.reject(error);
  }
);

export default api;


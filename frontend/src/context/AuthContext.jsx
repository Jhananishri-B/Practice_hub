import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // DEV BYPASS - Only enabled in development mode
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      const usernameLower = username?.toLowerCase().trim();
      const usernameUpper = username?.toUpperCase().trim();

      // Admin bypass
      if ((usernameLower === 'admin' || username === 'ADMIN' || username === 'admin@gmail.com') && password === '123') {
        const mockUser = { id: 'admin-1', username: 'ADMIN', role: 'admin', email: 'admin@gmail.com' };
        const mockToken = 'mock-jwt-token-dev-bypass';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true, user: mockUser };
      }

      // User/Student bypass
      if ((usernameLower === 'user' || username === 'USER') && password === '123') {
        const mockUser = { id: 'user-1', username: 'USER', role: 'student', email: 'user@gmail.com' };
        const mockToken = 'mock-jwt-token-dev-bypass-user';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true, user: mockUser };
      }
    }

    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Login error details:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const googleLogin = async (googleToken, code, redirectUri) => {
    try {
      const payload = code
        ? { code, redirectUri: redirectUri || window.location.origin }
        : { token: googleToken };
      const response = await api.post('/auth/google', payload);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Google login failed',
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send reset email',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, forgotPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


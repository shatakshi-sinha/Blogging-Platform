import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/auth/check');
          if (data.isAuthenticated) {
            setUser(data.user);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [logout]);

  const login = async (credentials, rememberMe = false) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', data.token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser({
        id: data.id,
        username: data.username,
        name: data.name,
        email: data.email
      });
      setIsAuthenticated(true);
      navigate('/');
      return data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/auth/check');
          if (data.isAuthenticated) {
            setUser(data.user);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [logout]);

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      navigate('/login');
      return data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated,
      login, 
      register, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
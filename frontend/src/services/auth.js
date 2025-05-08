import api from './api';

export const login = async (credentials, rememberMe = false) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (!response.data.token) {
      throw new Error('Invalid response from server');
    }
    
     // Store based on rememberMe choice
     const storage = rememberMe ? localStorage : sessionStorage;
     storage.setItem('token', response.data.token);
     storage.setItem('user', JSON.stringify(response.data.user));
     
    // Store token and user data
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (err) {
    let errorMessage = 'Login failed';
    
    if (err.response) {
      if (err.response.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
    }
    
    throw new Error(errorMessage);
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (!response.data.id) {
      throw new Error('Registration failed');
    }
    
    return response.data;
  } catch (err) {
    let errorMessage = 'Registration failed';
    
    if (err.response) {
      if (err.response.status === 409) {
        errorMessage = 'User already exists';
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
    }
    
    throw new Error(errorMessage);
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

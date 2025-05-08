import axios from 'axios';
export const getPostReactions = (postId) => api.get(`/reactions/${postId}`);
export const reactToPost = (data) => api.post('/reactions', data);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
        switch (error.response.status) {
            case 401: // Unauthorized
              localStorage.removeItem('token');
              // Don't redirect here - let components handle it
              break;
            case 403: // Forbidden
              // Add specific handling if needed
              break;
            case 500: // Server error
              // Handle server errors
              break;
            default:
              // Handle other errors
          }
    }
    return Promise.reject(error);
  }
);

export default api;

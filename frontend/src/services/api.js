import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401: // Unauthorized
          localStorage.removeItem('token');
          break;
        case 403: // Forbidden
          break;
        case 500: // Server error
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

// Define API methods
export const getPostReactions = (postId) => api.get(`/reactions/${postId}`);
export const reactToPost = (data) => api.post('/reactions', data);
export const updateComment = (commentId, data) => api.put(`/comments/${commentId}`, data);
export const updateProfile = (data) => api.put('/users/profile', data);
export const changePassword = (data) => api.put('/users/change-password', data);
export const archivePost = (id) => api.put(`/posts/archive/${id}`);
export const unarchivePost = (id) => api.put(`/posts/unarchive/${id}`);
export const fetchArchivedPosts = () => api.get('/posts/archived');
export const updateAbout = (aboutText) => api.put('/users/about', { about: aboutText });

export default api;





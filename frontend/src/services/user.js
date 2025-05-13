import axios from 'axios';
const API_URL = '/api/users';

// This function fetches the public profile of a user by their userId
const getPublicProfile = async (userId) => {
  const response = await axios.get(`${API_URL}/public/${userId}`);
  return response.data;
};

// This function fetches the account information of the logged-in user
const getAccountInfo = async () => {
  const response = await axios.get(`${API_URL}/account`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

// This function updates the account information of the logged-in user
const updateAccount = async (userData) => {
  const response = await axios.put(`${API_URL}/account`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

// This function updates the profile information of the logged-in user
const updateProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/profile`, profileData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

// Exporting the functions to be used in other parts of the application
export default {
  getPublicProfile,
  getAccountInfo,
  updateAccount,
  updateProfile
};

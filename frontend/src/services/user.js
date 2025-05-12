import axios from 'axios';


const API_URL = '/api/users';


const getPublicProfile = async (userId) => {
  const response = await axios.get(`${API_URL}/public/${userId}`);
  return response.data;
};


const getAccountInfo = async () => {
  const response = await axios.get(`${API_URL}/account`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};


const updateAccount = async (userData) => {
  const response = await axios.put(`${API_URL}/account`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};


const updateProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/profile`, profileData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};


export default {
  getPublicProfile,
  getAccountInfo,
  updateAccount,
  updateProfile
};

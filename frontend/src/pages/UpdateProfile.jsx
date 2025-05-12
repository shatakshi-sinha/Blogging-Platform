import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';




const UpdateProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    intro: ''
  });  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');




  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        intro: user.intro || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me'); // or '/users/account' if you expose it
        setFormData({
          username: res.data.username || '',
          name: res.data.name || '',
          email: res.data.email || '',
          intro: res.data.intro || ''
        });
      } catch (err) {
        setError('Failed to load profile');
      }
    };
  
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); // ✅ start loading
  
    if (!formData.username || !formData.name || !formData.email) {
      setError("Username, name and email are required");
      setLoading(false); // ✅ stop loading
      return;
    }
  
    try {
      const res = await api.put('/users/profile', formData);
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message); // ✅ DEBUG
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };
  




  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Update Profile
        </Typography>




        <form onSubmit={handleSubmit}>
          
        <TextField
  label="Username"
  fullWidth
  required
  value={formData.username}
  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
/>

<TextField
  label="Name"
  fullWidth
  required
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
/>

<TextField
  label="Email"
  fullWidth
  required
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
/>

<TextField
  label="Intro"
  fullWidth
  multiline
  rows={3}
  value={formData.intro}
  onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
/>




          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>




      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>




      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Container>
  );
};




export default UpdateProfile;

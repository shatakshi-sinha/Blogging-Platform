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

// Function to update user profile
const UpdateProfile = () => {
  const { user } = useAuth();
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

  // Load user data into form when component mounts
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
        const res = await api.get('/auth/me'); 
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); 
  
    if (!formData.username || !formData.name || !formData.email) {
      setError("Username, name and email are required");
      setLoading(false); 
      return;
    }
  
    try {
      const res = await api.put('/users/profile', formData);
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message); 
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false); 
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
          margin="normal"  
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          sx={{ mb: 2 }}  
        />

        <TextField
          label="Name"
          fullWidth
          required
          margin="normal"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Email"
          fullWidth
          required
          margin="normal"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Introduction"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={formData.intro}
          onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
          sx={{ mb: 2 }}
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    username: false,
    name: false,
    email: false,
    password: false,
    existingUser: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: false,
      existingUser: false // Clear existing user error when typing
    }));
  };

  const validateForm = () => {
    const newErrors = {
      username: !formData.username,
      name: !formData.name,
      email: !formData.email,
      password: !formData.password,
      existingUser: false
    };
    setErrors(newErrors);
    return !Object.values(newErrors).slice(0, 4).some(Boolean); // Don't include existingUser in validation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors(prev => ({ ...prev, existingUser: false }));
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // User already exists error
        setError('This email or username is already registered');
        setErrors(prev => ({ ...prev, existingUser: true }));
        
        // Highlight the problematic fields
        if (err.response.data?.field === 'email') {
          setErrors(prev => ({ ...prev, email: true }));
        } else if (err.response.data?.field === 'username') {
          setErrors(prev => ({ ...prev, username: true }));
        }
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ 
        mt: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            error={errors.username || errors.existingUser}
            helperText={
              errors.username ? 'Username is required' : 
              errors.existingUser ? 'Username already taken' : ''
            }
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            helperText={errors.name ? 'Name is required' : ''}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email || errors.existingUser}
            helperText={
              errors.email ? 'Email is required' : 
              errors.existingUser ? 'Email already registered' : ''
            }
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            helperText={errors.password ? 'Password is required' : ''}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
          
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
              Login here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
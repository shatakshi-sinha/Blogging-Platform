import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography,
  CircularProgress
} from '@mui/material';
import { login } from '../services/auth';

// Login component
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false 
  });
  const [errors, setErrors] = useState({
    email: false,
    password: false
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setErrors(prev => ({
      ...prev,
      [name]: false
    }));
  };

  const validateForm = () => {
    const newErrors = {
      email: !formData.email,
      password: !formData.password
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(formData, formData.rememberMe);  
      navigate('/home');
    } catch (err) {
      setSubmitError(err.message);
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
          Login
        </Typography>
        
        {submitError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {submitError}
          </Typography>
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            helperText={errors.email ? 'Email is required' : ''}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            helperText={errors.password ? 'Password is required' : ''}
          />
          
          <FormControlLabel
            control={
            <Checkbox value="rememberMe" 
            checked={formData.rememberMe}
            onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}color="primary" 
            />
          }
            label="Remember me"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
          Not registered?{' '}
          <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Register here
          </Link>
        </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;

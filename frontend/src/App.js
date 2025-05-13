import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Post from './pages/Post';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import WelcomePage from './components/WelcomePage';
import UpdateProfile from './pages/UpdateProfile';
import ChangePassword from './pages/ChangePassword';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5C4033', // Dark brown (navbar)
      light: '#7A6246', // Medium brown (hovers)
      dark: '#3E2A20', // Darker brown (active states)
      contrastText: '#FFFFFF' // White text
    },
    secondary: {
      main: '#A67B5B', // Light brown (buttons, accents)
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FFFFFF', // White
    },
    like: {
      main: '#1976D2', // Blue
      contrastText: '#FFFFFF', // White text
    },
    dislike: {
      main: '#D32F2F', // Red 
      contrastText: '#FFFFFF',
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none' 
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
      <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/posts/:id" element={<Post />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/create-post" element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } />
            <Route path="/update-profile" element={
              <ProtectedRoute>
                <UpdateProfile />
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } /> 
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
      </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

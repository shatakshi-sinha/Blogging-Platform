import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  CircularProgress,
  Button,
  Divider,
  Chip,
  Tab,
  Tabs
} from '@mui/material';
import api from '../services/api';
import { formatDate } from '../utils/dateUtils'; // You'll need to create this utility


const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [userRes, postsRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/posts/user/${userId}`)
        ]);
       
        setUser(userRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };


    fetchProfile();
  }, [userId]);


  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }


  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5">Profile not found</Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }


  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              fontSize: '2.5rem',
              bgcolor: 'primary.main'
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4">{user.name}</Typography>
            <Chip label={`@${user.username}`} variant="outlined" sx={{ mt: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Member since: {formatDate(user.createdAt)}
            </Typography>
          </Box>
        </Box>


        {user.intro && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Bio</Typography>
            <Typography>{user.intro}</Typography>
          </Box>
        )}
      </Paper>


      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Posts" />
        <Tab label="About" />
      </Tabs>


      {tabValue === 0 && (
        <Box sx={{ mt: 2 }}>
          {posts.length > 0 ? (
            posts.map(post => (
              <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">{post.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Posted on: {formatDate(post.createdAt)}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography>{post.content.substring(0, 200)}...</Typography>
              </Paper>
            ))
          ) : (
            <Typography sx={{ mt: 2 }}>No posts yet.</Typography>
          )}
        </Box>
      )}


      {tabValue === 1 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          {user.profile ? (
            <Typography>{user.profile}</Typography>
          ) : (
            <Typography color="text.secondary">No additional information provided.</Typography>
          )}
        </Paper>
      )}
    </Container>
  );
};


export default PublicProfile;

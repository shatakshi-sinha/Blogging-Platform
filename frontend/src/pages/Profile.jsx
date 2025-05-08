import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit, Delete, Settings, Logout, DeleteForever } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatPostDateTime } from '../utils/dateUtils';


const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [tempPostData, setTempPostData] = useState({ title: '', content: '' });
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);
  const [password, setPassword] = useState('');


  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }


    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [profileRes, postsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/posts/user/me')
        ]);
       
        setProfile(profileRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };


    fetchProfile();
  }, [user, navigate]);


  const handleEditClick = (post) => {
    setEditingPost(post);
    setTempPostData({ title: post.title, content: post.content });
  };


  const handleSaveEdit = async () => {
    try {
      await api.put(`/posts/${editingPost.postID}`, tempPostData);
      setPosts(posts.map(p =>
        p.postID === editingPost.postID ? { ...p, ...tempPostData } : p
      ));
      setEditingPost(null);
      setSuccess('Post updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    }
  };


  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p.postID !== postId));
      setDeleteConfirm(null);
      setSuccess('Post deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };


  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/me', { data: { password } });
      setSuccess('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteAccountConfirm(false);
      setPassword('');
    }
  };


  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mr: 3,
              fontSize: '2.5rem',
              bgcolor: 'primary.main'
            }}
          >
            {profile?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {profile?.name}
            </Typography>
            <Chip
              label={`@${profile?.username}`}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography variant="body1" sx={{ mt: 1 }}>
              {profile?.intro || 'No introduction yet.'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
  <Button
    variant="outlined"
    color="error"
    onClick={handleLogout}
    startIcon={<Logout />}
  >
    Logout
  </Button>
  <Button
    variant="outlined"
    color="error"
    onClick={() => setDeleteAccountConfirm(true)}
    startIcon={<DeleteForever />}
  >
    Delete Account
  </Button>
</Box>
        </Box>
      </Paper>
     
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab label="My Posts" icon={<Edit />} />
        <Tab label="Account Settings" icon={<Settings />} />
      </Tabs>
     
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            My Posts ({posts.length})
          </Typography>
         
          {posts.length > 0 ? (
            <List sx={{ bgcolor: 'background.paper' }}>
              {posts.map(post => (
                <React.Fragment key={post.postID}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="div">
                          {post.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {formatPostDateTime(post)}
                          </Typography>
                          <br />
                          {post.content.length > 100
                            ? `${post.content.substring(0, 100)}...`
                            : post.content}
                        </>
                      }
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleEditClick(post)}
                        color="primary"
                        aria-label="edit post"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteConfirm(post.postID)}
                        color="error"
                        aria-label="delete post"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                You haven't written any posts yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => navigate('/create-post')}
              >
                Create Your First Post
              </Button>
            </Paper>
          )}
        </Box>
      )}
     
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Account Settings
          </Typography>
          <Box component="dl" sx={{ mb: 3 }}>
            <Typography component="dt" variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography component="dd" variant="body1" sx={{ mb: 2 }}>
              {profile?.email}
            </Typography>
           
          </Box>
         
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/update-profile')}
          >
            Update Profile
          </Button>
        </Paper>
      )}


      {/* Edit Dialog */}
      <Dialog
        open={!!editingPost}
        onClose={() => setEditingPost(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="normal"
            label="Title"
            variant="outlined"
            value={tempPostData.title}
            onChange={(e) => setTempPostData({...tempPostData, title: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Content"
            variant="outlined"
            multiline
            minRows={6}
            maxRows={15}
            value={tempPostData.content}
            onChange={(e) => setTempPostData({...tempPostData, content: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingPost(null)}>Cancel</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
            disabled={!tempPostData.title || !tempPostData.content}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>


      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this post? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => handleDeletePost(deleteConfirm)}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>


      {/* Snackbars for notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
     
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>


      {/* Delete Account Dialog */}
<Dialog
  open={deleteAccountConfirm}
  onClose={() => {
    setDeleteAccountConfirm(false);
    setPassword('');
  }}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Delete Your Account</DialogTitle>
  <DialogContent>
    <DialogContentText sx={{ mb: 2 }}>
      This action cannot be undone. This will permanently delete your account and all associated data.
    </DialogContentText>
    <DialogContentText sx={{ mb: 2, fontWeight: 'bold' }}>
      To confirm, please enter your password:
    </DialogContentText>
    <TextField
      autoFocus
      margin="dense"
      label="Password"
      type="password"
      fullWidth
      variant="outlined"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => {
        setDeleteAccountConfirm(false);
        setPassword('');
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleDeleteAccount}
      color="error"
      variant="contained"
      disabled={!password}
      startIcon={<DeleteForever />}
    >
      Delete Account Permanently
    </Button>
  </DialogActions>
</Dialog>
    </Container>
  );
};


export default Profile;





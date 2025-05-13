import React, { useState, useEffect, useRef } from 'react';
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
import { Edit, Delete, Settings, Logout, DeleteForever, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatPostDateTime } from '../utils/dateUtils';
import { deleteAccount } from '../services/auth';
import { archivePost, unarchivePost } from '../services/api';
import { Save } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#795548', // brown
    },
    secondary: {
      main: '#d7ccc8', // light beige
    },
    background: {
      default: '#fffaf0', // light cream
      paper: '#f5f5f5',
    },
    text: {
      primary: '#212121',
      secondary: '#4e342e',
    },
  },
});

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
  const [tempPostData, setTempPostData] = useState({ title: '', description: '', content: '' });
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const editorRef = useRef(null);

  // Formatting functions for the rich text editor
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handlePublishDraft = async (postId) => {
    try {
      const response = await api.put(`/posts/${postId}/publish`);
      
      if (response.data.success) {
        setPosts(posts.map(post => 
          post.postID === postId ? { 
            ...post, 
            status: 'published',
            publishedAt: new Date().toISOString()
          } : post
        ));
        setSuccess('Draft published successfully!');
      } else {
        setError(response.data.message || 'Failed to publish draft');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish draft');
    }
  };

  const handleArchive = async (id) => {
    try {
      await archivePost(id);
      setSuccess('Post archived successfully!');
      fetchUserPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive post');
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await unarchivePost(id);
      setSuccess('Post unarchived successfully!');
      fetchUserPosts();        
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unarchive post');
    }
  };
  

  const fetchUserPosts = async () => {
    try {
      const response = await api.get('/posts/user/me');
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
    }
  };

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
    setTempPostData({ 
      title: post.title, 
      description: post.description || '', 
      content: post.content 
    });
  };

  const handleSaveEdit = async () => {
    const updatedContent = editorRef.current?.innerHTML || tempPostData.content;
    
    try {
      const response = await api.put(`/posts/${editingPost.postID}`, {
        title: tempPostData.title,
        description: tempPostData.description,
        content: updatedContent,
      });
  
      setPosts(posts.map(p =>
        p.postID === editingPost.postID ? { 
          ...p, 
          title: tempPostData.title,
          description: tempPostData.description,
          content: updatedContent,
        } : p
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
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(password);
      setSuccess('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 2000);
    } catch (err) {
      if (err.message.includes('Incorrect password')) {
        setPasswordError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSaveAbout = async () => {
  try {
    await api.put('/users/about', { about: profile.profile });
    setSuccess('About section updated successfully!');
    setIsEditingAbout(false);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to update about section');
  }
};

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
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
          <Box sx={{ flexGrow: 1, mt: 2 }}>
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
          </Box>
        </Box>
      </Paper>
     
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3, borderBottom: 1,
    borderColor: 'divider',
    backgroundColor: 'background.paper',
    borderRadius: 1, }}
        variant="fullWidth"
      >
        <Tab label="My Posts" icon={<Edit />} />
        <Tab label="About the Author" icon={<Person />} />
        <Tab label="Account Settings" icon={<Settings />} />
      </Tabs>
     
      {tabValue === 0 && (
  <Paper sx={{ p: 3, borderRadius: 2 }}>
    <Typography variant="h5" component="h2" gutterBottom>
      My Posts ({posts.length})
    </Typography>

    {posts.length > 0 ? (
      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        {posts.map((post) => (
          <React.Fragment key={post.postID}>
            <ListItem
              alignItems="flex-start"
              sx={{
                px: 2,
                //py: 2,
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">{post.title}</Typography>
                    {post.status === 'draft' && (
                      <Chip label="Draft" size="small" color="warning"
                       sx={{ 
                                ml: 1, 
                                backgroundColor: '#FBDB93',
                                color: '#5D4037',
                                fontWeight: 'bold',
                                border: '1px solid rgb(255, 187, 0)'
                              }} />
                    )}
                    {post.archived && (
                      <Chip label="Archived" size="small" sx={{ 
                                ml: 1, 
                                backgroundColor: '#EF9A9A',
                                color: '#5D4037',
                                fontWeight: 'bold',
                                border: '1px solid #EF5350'
                              }}  />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {formatPostDateTime(post)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.description || 'No description available'}
                    </Typography>
                  </>
                }
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {post.status === 'draft' && (
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => handlePublishDraft(post.postID)}
                  >
                    Publish
                  </Button>
                )}
                <IconButton onClick={() => handleEditClick(post)} color="primary">
                  <Edit fontSize="small" />
                </IconButton>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    post.archived
                      ? handleUnarchive(post.postID)
                      : handleArchive(post.postID)
                  }
                >
                  {post.archived ? 'Unarchive' : 'Archive'}
                </Button>
                <IconButton
                  onClick={() => setDeleteConfirm(post.postID)}
                  color="error"
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
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
        }}
      >
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
  </Paper>
)}

     
     {tabValue === 1 && (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h5" component="h2" gutterBottom>
      About the Author
    </Typography>
    
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        multiline
        rows={8}
        value={profile?.profile || ''}
        onChange={(e) => setProfile({ ...profile, profile: e.target.value })}
        InputProps={{
          readOnly: !isEditingAbout,
        }}
        sx={{ mt:2, mb: 2 }}
      />
      <IconButton
        sx={{ 
          position: 'absolute', 
    top: 22, 
    right: 8,
    border: '1px solid',
    borderColor: 'grey.300',
    backgroundColor: 'background.paper',
    color: 'text.secondary',
    '&:hover': {
      backgroundColor: 'grey.100',
      color: 'primary.main',
    }
        }}
        onClick={isEditingAbout ? handleSaveAbout : () => setIsEditingAbout(true)}
      >
        {isEditingAbout ? <Save /> : <Edit />}
      </IconButton>
    </Box>
  </Paper>
)}

     {tabValue === 2 && (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h5" component="h2" gutterBottom>
      Account Information
    </Typography>
   
    <Box sx={{ mt:2, mb: 3 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Username
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        @{profile?.username}
      </Typography>
     
      <Typography variant="subtitle2" color="text.secondary">
        Name
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {profile?.name}
      </Typography>
     
      <Typography variant="subtitle2" color="text.secondary">
        Email
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {profile?.email}
      </Typography>
     
      <Typography variant="subtitle2" color="text.secondary">
        Introduction
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
        {profile?.intro || 'No introduction yet.'}
      </Typography>
    </Box>


    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/update-profile')}
        startIcon={<Edit />}
      >
        Edit Profile
      </Button>
     
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate('/change-password')}
      >
        Change Password
      </Button>    
      <Button
        variant="outlined"
        color="error"
        onClick={() => setDeleteAccountConfirm(true)}
        startIcon={<DeleteForever />}
        sx={{ ml: 'auto' }}
      >
        Delete Account
      </Button>
    </Box>
  </Paper>
)}
      
      {/* Edit Dialog with Complete Rich Text Editor */}
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
            onChange={(e) => setTempPostData({ ...tempPostData, title: e.target.value })}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            variant="outlined"
            multiline
            rows={3}
            value={tempPostData.description}
            onChange={(e) => setTempPostData({...tempPostData, description: e.target.value})}
          />

          {/* Rich Text Editor Toolbar */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            mb: 1, 
            mt: 2,
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: 1
          }}>
            <Button 
              size="small" 
              onClick={() => formatText('bold')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              <b>B</b>
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('italic')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              <i>I</i>
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('underline')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              <u>U</u>
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('strikeThrough')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              <s>S</s>
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('insertOrderedList')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              OL
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('insertUnorderedList')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              UL
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('justifyLeft')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              Left
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('justifyCenter')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              Center
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('justifyRight')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              Right
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('formatBlock', '<h2>')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              H2
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('formatBlock', '<h3>')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              H3
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('formatBlock', '<p>')}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              P
            </Button>
            <Button 
              size="small" 
              onClick={() => formatText('createLink', prompt('Enter URL:'))}
              sx={{ minWidth: 0, padding: '4px 8px' }}
            >
              Link
            </Button>
          </Box>

          {/* Rich Text Editor Content */}
          <Box sx={{ 
            position: 'relative',
            marginTop: 1,
            marginBottom: 2
          }}>
            <Box
              contentEditable
              suppressContentEditableWarning
              ref={editorRef}
              sx={{
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: 1,
                minHeight: 300,
                padding: 2,
                mb: 2,
                whiteSpace: 'pre-wrap',
                overflowY: 'auto',
                '&:hover': {
                  borderColor: 'text.primary',
                },
                '&:focus-within': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                },
              }}
              dangerouslySetInnerHTML={
                editingPost ? { __html: tempPostData.content } : undefined
              }
            />
            <Typography
              component="span"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate(14px, -50%) scale(0.75)',
                backgroundColor: 'background.paper',
                padding: '0 4px',
                color: 'text.secondary',
                pointerEvents: 'none',
                transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
              }}
            >
              Content
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingPost(null)}>Cancel</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            sx={{ bgcolor: '#5D4037', '&:hover': { bgcolor: '#3E2723' } }} 
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Post Confirmation Dialog */}
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

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteAccountConfirm}
        onClose={() => {
          setDeleteAccountConfirm(false);
          setPassword('');
          setPasswordError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          <Box display="flex" alignItems="center">
            <DeleteForever sx={{ mr: 1 }} />
            Confirm Account Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This will permanently delete all your data including:
            <ul>
              <li>Your profile information</li>
              <li>All posts you've created</li>
              <li>All comments you've made</li>
            </ul>
          </Alert>
         
          <DialogContentText sx={{ mb: 2 }}>
            To confirm deletion, please enter your password:
          </DialogContentText>
         
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            error={!!passwordError}
            helperText={passwordError}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteAccountConfirm(false);
              setPassword('');
              setPasswordError('');
            }}
            disabled={isDeletingAccount}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={isDeletingAccount || !password}
            startIcon={
              isDeletingAccount ?
                <CircularProgress size={20} color="inherit" /> :
                <DeleteForever />
            }
          >
            {isDeletingAccount ? 'Deleting...' : 'Delete Permanently'}
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
    </Container>
    </ThemeProvider>
  );
};

export default Profile;
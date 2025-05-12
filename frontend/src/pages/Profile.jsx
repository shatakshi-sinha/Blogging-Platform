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
import { Edit, Delete, Settings, Logout, DeleteForever } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatPostDateTime } from '../utils/dateUtils';
import { deleteAccount } from '../services/auth';


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
  const editorRef = useRef(null);
  
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
    setTempPostData({ title: post.title, description: post.description || '', content: post.content });
  };


  const handleSaveEdit = async () => {
    const updatedContent = editorRef.current?.innerHTML || tempPostData.content;
    
    try {
      const response = await api.put(`/posts/${editingPost.postID}`, {
        title: tempPostData.title,
        description: tempPostData.description,
        content: updatedContent, // Prioritizes editorRef content, falls back to tempPostData
      });
  
      // Update the posts list
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
    window.location.reload(); // This forces a page reload after logout
  };


// In your handleDeleteAccount function:
const handleDeleteAccount = async () => {
  try {
    await deleteAccount(password);
    setSuccess('Account deleted successfully. Redirecting...');
    setTimeout(() => {
      navigate('/');  // Redirect to the home page
      window.location.reload();  // Force a page reload after account deletion
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
              sx={{
                mt: 1,
                borderColor: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText'
                }
              }}
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
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" component="span">
                            {post.title}
                          </Typography>
                          {post.status === 'draft' && (
                            <Chip 
                              label="Draft" 
                              size="small" 
                              color="warning"
                              sx={{ ml: 1, backgroundColor: '#FBDB93',  // Light yellow background
                              color: '#5D4037',           // Dark brown text
                              fontWeight: 'bold',
                              border: '1px solid #FFD600'  // Gold border
                              }} 
                            />
                          )}
                        </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              display="block"
                              sx={{ mb: 1 }}
                            >
                              {formatPostDateTime(post)}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {post.description || "No description available"}
                            </Typography>
                          </>
                        }
                        sx={{ mr: 2 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                    {post.status === 'draft' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => handlePublishDraft(post.postID)}
                        sx={{ 
                          alignSelf: 'center',
                          textTransform: 'none'
                        }}
                      >
                        Publish
                      </Button>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
  {/* Publish Button (if you added it) */}
  <IconButton 
    onClick={() => handleEditClick(post)}
    sx={{ 
      color: '#5C4033', // Classic brown color
      '&:hover': {
        backgroundColor: 'rgba(139, 69, 19, 0.1)' // Light brown hover
      }
    }}
  >
    <Edit />
  </IconButton>
  <IconButton 
    onClick={() => setDeleteConfirm(post.postID)}
    sx={{ 
      color: '#d32f2f', // MUI's default error red
      '&:hover': {
        backgroundColor: 'rgba(211, 47, 47, 0.1)' // Light red hover
      }
    }}
  >
    <Delete />
  </IconButton>
</Box>
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


      {/* Edit Dialog with Rich Text Editor */}
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

    {/* NEW: Description Field */}
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


    {/* Custom Toolbar */}
    <Box sx={{ display: 'flex', gap: 1, mb: 1, mt: 1 }}>
      <Button size="small" onClick={() => document.execCommand('bold')}><b>B</b></Button>
      <Button size="small" onClick={() => document.execCommand('italic')}><i>I</i></Button>
      <Button size="small" onClick={() => document.execCommand('underline')}><u>U</u></Button>
    {/*<Button size="small" onClick={() => document.execCommand('formatBlock', false, 'h3')}>H3</Button>*/}
      <Button size="small" onClick={() => document.execCommand('justifyLeft')}>Left</Button>
      <Button size="small" onClick={() => document.execCommand('justifyCenter')}>Center</Button>
      <Button size="small" onClick={() => document.execCommand('justifyRight')}>Right</Button>
      <Button size="small" onClick={() => document.execCommand('justifyFull')}>Justify</Button>
    </Box>

  {/* Rich Text Editor */}
<Box sx={{ 
  position: 'relative',
  marginTop: 2, 
  marginBottom: 1
}}>
  {/* The actual content editable div */}
  <Box
    contentEditable
    suppressContentEditableWarning
    ref={editorRef}
    sx={{
      border: '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: 1,
      minHeight: 200,
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
    onInput={(e) => {
      // Save selection before state update
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(e.currentTarget);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;

      setTempPostData({ 
        ...tempPostData, 
        content: e.currentTarget.innerHTML 
      });

      // Restore selection after state update
      requestAnimationFrame(() => {
        const newRange = document.createRange();
        let charCount = 0;
        const nodeStack = [editorRef.current];
        let node;
        let foundStart = false;
        
        while (nodeStack.length && !foundStart) {
          node = nodeStack.pop();
          if (node.nodeType === Node.TEXT_NODE) {
            const nextCharCount = charCount + node.length;
            if (!foundStart && start >= charCount && start <= nextCharCount) {
              newRange.setStart(node, start - charCount);
              foundStart = true;
            }
            charCount = nextCharCount;
          } else {
            for (let i = node.childNodes.length - 1; i >= 0; i--) {
              nodeStack.push(node.childNodes[i]);
            }
          }
        }

        selection.removeAllRanges();
        selection.addRange(newRange);
      });
    }}
    onFocus={() => {
      if (!editorRef.current.innerHTML && !tempPostData.content) {
        editorRef.current.innerHTML = '';
      }
    }}
    dangerouslySetInnerHTML={
      editingPost ? { __html: tempPostData.content } : undefined
    }
  />
  
  {/* The floating label */}
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
      //color="primary"
      //disabled={!tempPostData.title || !tempPostData.content}
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
  );
};


export default Profile;

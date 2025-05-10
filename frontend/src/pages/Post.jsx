import React, { useEffect, useState } from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  //ListItemText,
  Chip,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';



const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reactions, setReactions] = useState({ like: 0, dislike: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const { user } = useAuth();

  // Remove the separate comments useEffect and modify the main fetch:
useEffect(() => {
  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      
      if (!response.data || !response.data.title) {
        throw new Error('Invalid post data');
      }
      
      setPost({
        ...response.data,
        // Ensure arrays exist even if empty
        categories: response.data.categories || [],
        comments: response.data.comments || []
      });
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load post');
      navigate('/404', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  fetchPost();
}, [id, navigate]);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await api.get(`/posts/${id}/comments`);
        setPost(prev => ({ 
          ...prev, 
          comments: response.data 
        }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    };
    
    loadComments();
  }, [id]);

  // Fetch reactions when post loads
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await api.get(`/reactions/${id}`);
        setReactions({
          like: response.data.reactions.like || 0,
          dislike: response.data.reactions.dislike || 0
        });
        setUserReaction(response.data.userReaction);
      } catch (err) {
        console.error('Failed to load reactions:', err);
      }
    };
    
    if (post) {
      fetchReactions();
    }
  }, [id, post]);
  
  // Add this handler function
  const handleReaction = async (reactionType) => {
    if (!user) return; // Don't allow reactions if not logged in
  
    try {
      const newReaction = userReaction === reactionType ? null : reactionType;
      const response = await api.post('/reactions', {
        postId: id,
        reactionType: newReaction
      });
  
      setReactions(response.data.reactions);
      setUserReaction(newReaction);
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
  
    setSubmitting(true);
    try {
      const response = await api.post(`/comments/posts/${id}`, {
        content: commentContent
      });
      
      setPost(prev => ({
        ...prev,
        comments: [response.data, ...prev.comments]
      }));
      
      setCommentContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  // Additional safety check
  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Post not found</Alert>
      </Container>
    );
  }

  const handleCommentDelete = (deletedCommentId) => {
    setPost(prevPost => {
      const removeComment = (comments) => {
        return comments
          .filter(comment => comment.commentID !== deletedCommentId)
          .map(comment => ({
            ...comment,
            replies: removeComment(comment.replies || [])
          }));
      };

      return {
        ...prevPost,
        comments: removeComment(prevPost.comments)
      };
    });
  };

  const handleCommentEdit = (commentId, newContent) => {
  setPost(prevPost => {
    const updateCommentContent = (comments) => {
      return comments.map(comment => {
        if (comment.commentID === commentId) {
          return {
            ...comment,
            content: newContent,
            editedAt: new Date().toISOString()
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentContent(comment.replies)
          };
        }
        return comment;
      });
    };

    return {
      ...prevPost,
      comments: updateCommentContent(prevPost.comments)
    };
  });
};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ 
         p: 3,
         mb: 3,
         backgroundColor: '#F9F9F5', // Light beige background
         borderLeft: '4px solid #A67B5B', // Brown accent border
         boxShadow: '0 2px 8px rgba(94, 64, 51, 0.1)' // Subtle shadow
      }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          color: '#5C4033', // Dark brown
          fontWeight: '500',
          fontFamily: '"Playfair Display", serif' // Consider a nice font
        }}>
          {post.title}
        </Typography>
        
        {/* Replace the existing date display with this: */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" color="#6d412a">
          By {post.name || 'Unknown author'} ({post.username || 'anonymous'})
        </Typography>
        <Typography variant="subtitle1" color="#7A6246" sx={{ ml: 2, fontSize: '0.9rem' }}>
          {post.updatedAt > post.createdAt ? (
            `Updated ${format(new Date(post.updatedAt), 'MMM d, yyyy  (h:mm a)')}`
          ) : (
            format(new Date(post.createdAt), 'MMM d, yyyy (h:mm a)')
          )}
        </Typography>
        </Box>
        
        
        <Box sx={{  display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          border: '1px solid #ddd',
          borderRadius: 1,
          p: 1,
          mb:2,
          width: 'fit-content'}}>
          <Button
            variant={userReaction === 'like' ? 'contained' : 'outlined'}
            startIcon={<ThumbUpIcon />}
            onClick={() => handleReaction('like')}
            size="small"
            color="like"
            sx={{ minWidth: 80 }}
          >
            {reactions.like || 0}
          </Button>
          <Button
            variant={userReaction === 'dislike' ? 'contained' : 'outlined'}
            startIcon={<ThumbDownIcon />}
            onClick={() => handleReaction('dislike')}
            size="small"
            color="dislike"
            sx={{ minWidth: 80 }}
          >
            {reactions.dislike || 0}
          </Button>
        </Box>

        {(post.categories?.length > 0) && (
          <Box sx={{ mb: 2 }}>
            {post.categories.map(category => (
              <Chip
                key={category.catID || category.title}
                label={category.title}
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body1" paragraph>
          {post.content || 'No content available'}
        </Typography>
      </Paper>

      {/* Comments Section */}
      <Paper sx={{ 
        p: 3,
        backgroundColor: '#FFFFFF', // White background
        border: '1px solid #E8E0D5', // Light beige border
        borderRadius: '8px',
        boxShadow: 'none' // Flatter design for comments
      }}>
        <Typography variant="h5" gutterBottom color="#5C4033">
          Comments ({(post.comments?.length) || 0})
        </Typography>
        
        {user && (
          <Box component="form" onSubmit={handleSubmitComment} sx={{ 
            mb: 3,
            p: 2,
            backgroundColor: '#F9F9F5',
            borderRadius: '8px',
            border: '1px solid #E8E0D5'
          }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={submitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#D2B48C' // Beige border
                  },
                  '&:hover fieldset': {
                    borderColor: '#A67B5B' // Brown on hover
                  }
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ 
                mt: 1,
                backgroundColor: '#8B7355', // Medium brown
                '&:hover': {
                  backgroundColor: '#7A6246' // Darker brown
                }
              }}
              disabled={!commentContent.trim() || submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Post Comment'}
            </Button>
          </Box>
        )}
        
        <List>
      {post.comments?.map(comment => (
        <ListItem key={comment.commentID} alignItems="flex-start" sx={{ display: 'block', p: 0 }}>
          <Comment 
            comment={comment} 
            postId={id}
            depth={0}
            onDelete={handleCommentDelete}
            onEdit={handleCommentEdit} 
          />
        </ListItem>
      ))}
    </List>
      </Paper>
    </Container>
  );
};
// Add this new component inside Post.jsx
// Update the Comment component to properly handle nested structure
const Comment = ({ comment, postId, depth = 0, onDelete, onEdit }) => {
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { user } = useAuth();

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setSubmittingReply(true);
    try {
      const response = await api.post(
        `/comments/posts/${postId}/comments/${comment.commentID}/replies`,
        { content: replyContent }
      );
      
      if (!comment.replies) comment.replies = [];
      comment.replies.unshift(response.data);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (err) {
      console.error('Error submitting reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/comments/${comment.commentID}`);
      setShowDeleteConfirm(false);
      onDelete(comment.commentID); // Call the passed onDelete handler
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };
  //const formattedDate = format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a');

  const handleEditSubmit = async () => {
  try {
    const response = await api.put(`/comments/${comment.commentID}`, {
      content: editedContent
    });
    
    if (response.data) {
      // Update the comment in the parent state
      onEdit(comment.commentID, editedContent);
      setIsEditing(false);
    } else {
      console.error('Empty response from server');
      // You might want to set some error state here
    }
  } catch (err) {
    console.error('Error updating comment:', err);
    // Add error handling UI feedback here
  }
};

  return (
    <Box sx={{ 
      ml: depth > 0 ? `${Math.min(depth * 16, 80)}px` : 0,
      pl: depth > 0 ? 2 : 0,
      borderLeft: depth > 0 ? '2px solid #D2B48C' : 'none', // Beige accent for replies
      mb: 2,
      p: 2,
      backgroundColor: depth % 2 === 0 ? '#FFFFFF' : '#F9F9F5', // Alternating subtle background
      borderRadius: '4px',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#F9F9F5' // Slightly darker on hover
      }
    }}>
      {/* Comment header - make it more prominent */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1,
        borderBottom: '1px solid #E8E0D5',
        pb: 1
      }}>
        <Typography variant="subtitle2" sx={{ 
          fontWeight: 'bold',
          color: '#5C4033' // Dark brown text
        }}>
          {comment.name || comment.username}
        </Typography>
        <Typography variant="caption" sx={{ 
          ml: 1, 
          color: '#8B7355' // Medium brown for date
        }}>
        {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
        </Typography>
        {comment.editedAt && (
        <Typography variant="caption" sx={{ ml: 1, color: '#8B7355', fontStyle: 'italic' }}>
          (edited)
        </Typography>
      )}
      </Box>
      
      {/* Comment content - updated to support editing */}
      {isEditing ? (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            multiline
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleEditSubmit}
            sx={{ mr: 1 }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setIsEditing(false);
              setEditedContent(comment.content);
            }}
          >
            Cancel
          </Button>
        </Box>
      ) : (
        <Typography variant="body2" paragraph sx={{ color: '#1E1E1E' }}>
          {comment.content}
        </Typography>
      )}
      
      {/* Action buttons - add Edit button */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {user && (
          <Button 
            size="small" 
            onClick={() => setShowReplyForm(!showReplyForm)}
            sx={{
              color: '#8B7355',
              '&:hover': { backgroundColor: '#F0E8DC' }
            }}
          >
            Reply
          </Button>
        )}
        
        {user?.userID === comment.userID && (
          <>
            <Button
              size="small"
              onClick={() => setIsEditing(true)}
              sx={{
                color: '#8B7355',
                '&:hover': { backgroundColor: '#F0E8DC' }
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
            
            {showDeleteConfirm && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption">
                  Delete this comment?
                </Typography>
                <Button 
                  size="small" 
                  color="error"
                  variant="contained"
                  onClick={handleDelete}
                >
                  Confirm
                </Button>
                <Button 
                  size="small" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
      
      {/* Reply form */}
      {showReplyForm && (
        <Box component="form" onSubmit={handleReplySubmit} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            disabled={submittingReply}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{ mt: 1, mr: 1 }}
            disabled={!replyContent.trim() || submittingReply}
          >
            {submittingReply ? <CircularProgress size={20} /> : 'Post Reply'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => setShowReplyForm(false)}
          >
            Cancel
          </Button>
        </Box>
      )}
      
      {/* Replies */}
      {comment.replies?.map(reply => (
        <Comment 
        key={reply.commentID} 
        comment={reply} 
        postId={postId}
        depth={depth + 1}
        onDelete={onDelete}
        onEdit={onEdit}
      />
      ))}
    </Box>
  );
};

export default Post;

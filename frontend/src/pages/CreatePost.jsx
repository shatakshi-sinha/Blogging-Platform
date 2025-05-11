import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  IconButton
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import api from '../services/api';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import TitleIcon from '@mui/icons-material/Title';




const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [isDraft, setIsDraft] = useState(false); 


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        setError('Failed to load categories');
      }
    };




    fetchCategories();
  }, []);




  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, slug]);




  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };
 
 
  const handleSubmit = async (e, shouldSaveAsDraft = false) => {
    e.preventDefault();

    if (!title || !slug) {
      setError('Title and slug are required');
      return;
    }

    setLoading(true);
    setIsDraft(shouldSaveAsDraft);

    try {
      await api.post('/posts', {
        title,
        slug,
        description, // Add this
        content: contentRef.current.innerHTML,
        categoryIds: selectedCategories,
        isDraft: shouldSaveAsDraft,
      });
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Post
        </Typography>


        <Box component="form" onSubmit={(e) => handleSubmit(e, false)} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />


          <TextField
            fullWidth
            margin="normal"
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText="URL-friendly version of your post title"
            required
          />


          <FormControl fullWidth margin="normal">
            <InputLabel>Categories</InputLabel>
            <Select
              multiple
              value={selectedCategories}
              onChange={(e) => setSelectedCategories(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={categories.find(c => c.catID === value)?.title}
                    />
                  ))}
                </Box>
              )}
              label="Categories"
            >
              {categories.map((category) => (
                <MenuItem key={category.catID} value={category.catID}>
                  {category.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


         
          <TextField
            fullWidth
            margin="normal"
            label="Post Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            helperText="Brief summary of your post (shown on post cards)"
            multiline
            rows={3}
          />


          <Typography sx={{ mt: 2, mb: 1 }}>Content</Typography>


          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <IconButton onClick={() => formatText('bold')}><FormatBoldIcon /></IconButton>
            <IconButton onClick={() => formatText('italic')}><FormatItalicIcon /></IconButton>
            <IconButton onClick={() => formatText('underline')}><FormatUnderlinedIcon /></IconButton>
            <IconButton onClick={() => formatText('formatBlock', '<h1>')}><TitleIcon /></IconButton>
            <IconButton onClick={() => formatText('justifyLeft')}><FormatAlignLeftIcon /></IconButton>
            <IconButton onClick={() => formatText('justifyCenter')}><FormatAlignCenterIcon /></IconButton>
            <IconButton onClick={() => formatText('justifyRight')}><FormatAlignRightIcon /></IconButton>
            <IconButton onClick={() => formatText('justifyFull')}><FormatAlignJustifyIcon /></IconButton>
            <IconButton onClick={() => formatText('removeFormat')}><FormatClearIcon /></IconButton>
          </Stack>




          <Box
            ref={contentRef}
            contentEditable
            sx={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              minHeight: 200,
              padding: 2,
              mb: 2,
              outline: 'none',
              whiteSpace: 'pre-wrap'
            }}
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
          />




          <Stack direction="row" spacing={2}>
            <Button
              type="button"
              variant="contained"
              size="large"
              disabled={loading}
              onClick={(e) => handleSubmit(e, false)}
            >
              {loading ? <CircularProgress size={24} /> : 'Publish Post'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="large"
              disabled={loading}
              onClick={(e) => handleSubmit(e, true)}
            >
              {loading ? <CircularProgress size={24} /> : 'Save as Draft'}
            </Button>
          </Stack>
        </Box>
      </Box>




      {/* Error/Success notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>


      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert severity="success">
           {isDraft ? 'Post saved as draft successfully!' : 'Post published successfully!'}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreatePost;
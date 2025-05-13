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
  const [contentFocused, setContentFocused] = useState(false);

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
      setError('Title is required');
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
    <ThemeProvider theme={theme}>
    <Container maxWidth="md">
      <Box sx={{  mt: 4,
      p: 4,
      borderRadius: 2,
      backgroundColor: 'background.paper',
      boxShadow: 3, }}>
        <Typography variant="h4" sx={{ fontFamily: 'Merriweather, serif', display: 'flex', alignItems: 'center', mb: 3 }}>
         
  Create New Post
  <Box
    component="img"
    src="/images/quill3.jpg" // or a URL
    alt="Pen"
    sx={{ width: 40, height: 40, ml: 2 }}
  /> 
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


          {/*<TextField
            fullWidth
            margin="normal"
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText="URL-friendly version of your post title"
            required
          />*/}


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


          <Stack direction="row" spacing={1} sx={{ mb: 1, mt: 2 }}>
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



          <Box sx={{ position: 'relative', mt: 2, mb: 2 }}>
            <Box
              ref={contentRef}
              contentEditable
              sx={{
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                minHeight: 200,
                padding: 2,
                pt: 3, // Add padding top for the label
                outline: 'none',
                whiteSpace: 'pre-wrap',
                '&:hover': {
                  borderColor: 'text.primary',
                },
                '&:focus-within': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                },
              }}
              onInput={(e) => setContent(e.currentTarget.innerHTML)}
              onFocus={() => setContentFocused(true)}
              onBlur={() => setContentFocused(!!content)}
            />
            <Typography
              component="span"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: content || contentFocused 
                  ? 'translate(14px, -50%) scale(0.75)' 
                  : 'translate(14px, 16px) scale(1)',
                backgroundColor: content || contentFocused ? 'background.paper' : 'transparent',
                padding: '0 4px',
                color: contentFocused ? 'primary.main' : 'text.secondary',
                pointerEvents: 'none',
                transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
              }}
            >
              Content
            </Typography>
          </Box>




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
    </ThemeProvider>
  );
};

export default CreatePost;
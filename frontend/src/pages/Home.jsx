import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Box,
  Paper,
  Typography,
  CircularProgress,
  InputAdornment,
  Chip,
  Button,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { fetchArchivedPosts } from '../services/api';

// Color constants
const colors = {
  white: '#FFFFFF',
  beige: {
    light: '#F5F5DC',
    medium: '#E8E0D5',
    dark: '#D2B48C'
  },
  brown: {
    light: '#A67B5B',
    medium: '#8B7355',
    dark: '#5C4033'
  },
  black: '#1E1E1E'
};

// Main Home component
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('published');

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let res;
        if (filter === 'archived') {
          res = await fetchArchivedPosts();
        } else {
          res = await api.get('/posts');
        }
        setPosts(res.data);
        setFilteredPosts(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filter]);

  // Enhanced search filtering
  useEffect(() => {
    const results = posts.filter(post => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      const hasTitleMatch = post.title?.toLowerCase().includes(term);
      const hasContentMatch = post.content?.toLowerCase().includes(term);
      const hasCategoryMatch = post.categories?.some(cat => 
        cat?.title?.toLowerCase().includes(term)
      );

      switch (searchFilter) {
        case 'title': return hasTitleMatch;
        case 'content': return hasContentMatch;
        case 'categories': return hasCategoryMatch;
        default: return hasTitleMatch || hasContentMatch || hasCategoryMatch;
      }
    });
    setFilteredPosts(results);
  }, [searchTerm, searchFilter, posts]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.brown.medium }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, minHeight: '60vh' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
      {/* Search and Filter Section */}
      <Paper
      elevation={2}
      sx={{
        mb: 4,
        p: 3,
        backgroundColor: colors.beige.medium,
        borderRadius: 2,
        border: `1px solid ${colors.beige.dark}`
      }}
    >

    {/* Search Bar + Dropdown Row */}
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: colors.brown.medium }} />
            </InputAdornment>
          ),
          sx: {
            backgroundColor: colors.white,
            borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.brown.light,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.brown.medium,
           }
          }
         }}
      />

    {/* Dropdown for Post Type Filter */}
    <TextField
      select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      sx={{
        width: { xs: '100%', sm: '200px' },
        backgroundColor: colors.white,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.brown.light,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.brown.medium,
        }
      }}
    >
      <MenuItem value="published">Published Posts</MenuItem>
      <MenuItem value="archived">Archived Posts</MenuItem>
    </TextField>
    </Box>

    {/* Filter Chips */}
    <Box sx={{
      display: 'flex',
      gap: 1,
      mt: 2,
      flexWrap: 'wrap'
    }}>
      {['all', 'title', 'content', 'categories'].map((filterOption) => (
        <Chip
          key={filterOption}
          label={filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          onClick={() => setSearchFilter(filterOption)}
          sx={{
            backgroundColor: searchFilter === filterOption
              ? colors.brown.dark
              : colors.beige.medium,
            color: searchFilter === filterOption ? colors.white : colors.brown.dark,
            '&:hover': {
              backgroundColor: searchFilter === filterOption
                ? colors.brown.dark
                : '#D7C4B7'
            }
          }}
        />
      ))}
    </Box>
    </Paper>


      {/* Posts Display */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        },
        gap: 3
      }}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard
              key={post.postID}
              post={post}
              sx={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.beige.dark}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 6px 12px rgba(92, 64, 51, 0.15)`,
                  borderColor: colors.brown.light
                }
              }}
            />
          ))
        ) : (
          <Paper
            sx={{
              p: 4,
              gridColumn: '1 / -1',
              backgroundColor: colors.beige.medium,
              textAlign: 'center',
              border: `1px dashed ${colors.brown.light}`
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: colors.brown.dark,
                mb: 2
              }}
            >
              {searchTerm
                ? `No posts found matching "${searchTerm}" in ${searchFilter}`
                : filter === 'archived'
                  ? 'No archived posts available'
                  : 'No published posts available'}
            </Typography>
            {searchTerm && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSearchFilter('all');
                }}
                sx={{
                  color: colors.white,
                  backgroundColor: colors.brown.light,
                  '&:hover': {
                    backgroundColor: colors.brown.dark
                  }
                }}
              >
                Clear Search
              </Button>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Home;

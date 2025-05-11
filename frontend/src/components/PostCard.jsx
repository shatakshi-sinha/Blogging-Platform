import React from 'react';
import { Card, CardContent, Typography, Button, Chip, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';


const PostCard = ({ post, sx }) => {
  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...sx
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          gutterBottom
          variant="h5"
          component="h2"
          sx={{ color: '#5C4033' }}
        >
          {post.title}
        </Typography>
       
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {post.description || 'No description available'}
        </Typography>
       
        <Box sx={{ mb: 2 }}>
          {post.categories?.map(category => (
            <Chip
              key={category.catID}
              label={category.title}
              size="small"
              sx={{
                mr: 1,
                mb: 1,
                backgroundColor: '#E8E0D5',
                color: 'brown'
              }}
            />
          ))}
        </Box>
      </CardContent>
     
      <Box sx={{ p: 2, backgroundColor: '#E8E0D5' }}>
        <Typography variant="caption" display="block" sx={{ color: 'brown' }}>
          Posted by {post.name} on {format(new Date(post.createdAt), 'MMM d, yyyy')}
        </Typography>
        <Button
          size="small"
          component={Link}
          to={`/posts/${post.postID}`}
          sx={{
            mt: 1,
            color: 'brown',
            borderColor: 'brown',
            '&:hover': {
              backgroundColor: 'rgba(139, 69, 19, 0.1)',
              borderColor: 'brown'
            }
          }}
          variant="outlined"
        >
          Read More
        </Button>
      </Box>
    </Card>
  );
};


export default PostCard;

const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    // Skip ownership check for admin users if you have that role
    // if (req.user.role === 'admin') return next();
    
    const [post] = await db.execute(
      'SELECT userID FROM post WHERE postID = ?',
      [req.params.id]
    );
    
    if (!post.length) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post[0].userID !== req.user.id) {
      return res.status(403).json({ 
        message: 'Unauthorized: You are not the author of this post' 
      });
    }
    
    next();
  } catch (err) {
    console.error('Post ownership verification error:', err);
    res.status(500).json({ 
      message: 'Server error during post authorization',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
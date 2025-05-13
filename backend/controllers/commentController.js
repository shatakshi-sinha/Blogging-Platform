const db = require('../config/db');

/**
 * Creates a reply to a comment.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.createReply = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId, commentId } = req.params;

    // Validate input
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Verify parent comment exists and belongs to the same post
    const [parentComments] = await db.execute(
      'SELECT * FROM post_comment WHERE commentID = ? AND postID = ?',
      [commentId, postId]
    );

    if (parentComments.length === 0) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    // Create reply
    const [result] = await db.execute(
      'INSERT INTO post_comment (postID, userID, parentCommentID, content, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [postId, req.user.id, commentId, content]
    );

    // Get the full reply with user info
    const [replies] = await db.execute(`
      SELECT pc.*, u.username, u.name
      FROM post_comment pc
      JOIN user u ON pc.userID = u.userID
      WHERE pc.commentID = ?
    `, [result.insertId]);

    res.status(201).json(replies[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves comments for a specific post, including nested replies.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getCommentsByPostId = async (req, res) => {
  try {
    const [comments] = await db.execute(`
      SELECT 
        pc.*, 
        u.username, 
        u.name,
        u.userID
      FROM post_comment pc
      JOIN user u ON pc.userID = u.userID
      WHERE pc.postID = ?
      ORDER BY pc.createdAt ASC
    `, [req.params.postId]);

    // Build the comment tree
    const buildCommentTree = (comments, parentId = null) => {
      return comments
        .filter(comment => {
          if (parentId === null) {
            return comment.parentCommentID === null;
          }
          return comment.parentCommentID === parentId;
        })
        .map(comment => ({
          ...comment,
          replies: buildCommentTree(comments, comment.commentID)
        }));
    };

    const nestedComments = buildCommentTree(comments);
    
    res.json(nestedComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Creates a new comment for a specific post.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;

    // Validate input
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Verify post exists
    const [posts] = await db.execute(
      'SELECT * FROM post WHERE postID = ? AND status = "published"',
      [req.params.postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create comment
    const [result] = await db.execute(
      'INSERT INTO post_comment (postID, userID, content, createdAt) VALUES (?, ?, ?, NOW())',
      [req.params.postId, req.user.id, content]
    );

    // Get the full comment with user info
    const [comments] = await db.execute(`
      SELECT pc.*, u.username, u.name
      FROM post_comment pc
      JOIN user u ON pc.userID = u.userID
      WHERE pc.commentID = ?
    `, [result.insertId]);

    res.status(201).json(comments[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Updates an existing comment.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports .updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;

    // Validation
    if (!content) return res.status(400).json({ message: 'Content is required' });

    // Verify comment exists and belongs to user
    const [comments] = await db.execute(
      'SELECT * FROM post_comment WHERE commentID = ? AND userID = ?',
      [commentId, req.user.id]
    );

    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found or not authorized' });
    }

    // Update in database (with editedAt timestamp)
    await db.execute(
      'UPDATE post_comment SET content = ?, editedAt = NOW() WHERE commentID = ?',
      [content, commentId]
    );

    // Return the updated comment with user info
    const [updatedComments] = await db.execute(`
      SELECT pc.*, u.username, u.name
      FROM post_comment pc
      JOIN user u ON pc.userID = u.userID
      WHERE pc.commentID = ?
    `, [commentId]);

    res.json(updatedComments[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Deletes a comment.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    // Verify comment exists and belongs to user (or user is admin)
    const [comments] = await db.execute(
      'SELECT * FROM post_comment WHERE commentID = ? AND userID = ?',
      [commentId, req.user.id]
    );

    if (comments.length === 0) {
      return res.status(404).json({ 
        message: 'Comment not found or not authorized' 
      });
    }

    // Delete comment (MySQL will handle reply deletion via ON DELETE CASCADE)
    await db.execute(
      'DELETE FROM post_comment WHERE commentID = ?',
      [commentId]
    );

    res.json({ 
      success: true,
      message: 'Comment deleted successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
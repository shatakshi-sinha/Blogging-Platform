const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
//router.get('/posts/:postId', commentController.getCommentsByPostId);
router.get('/posts/:postId/comments', commentController.getCommentsByPostId);

// Protected routes
router.post('/posts/:postId', authMiddleware, commentController.createComment);
router.post('/posts/:postId/comments/:commentId/replies', authMiddleware, commentController.createReply);
router.delete('/:id', authMiddleware, commentController.deleteComment);
router.put('/:id', authMiddleware, commentController.updateComment);

module.exports = router;

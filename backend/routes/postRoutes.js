const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.get('/user/me', authMiddleware, postController.getPostsByUser);

// Protected routes
router.post('/', authMiddleware, postController.createPost);
router.post('/:id/comments', authMiddleware, postController.createComment);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;

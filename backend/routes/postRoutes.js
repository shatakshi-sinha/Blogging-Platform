const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const verifyPostOwner = require('../middlewares/verifyPostOwner');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/archived', postController.getArchivedPosts);
router.get('/:id', postController.getPostById);
router.get('/user/me', authMiddleware, postController.getPostsByUser);
router.get('/user/drafts', authMiddleware, postController.getUserDrafts);
router.put('/:id/publish', authMiddleware, postController.publishDraft);
// Protected routes
router.post('/', authMiddleware, postController.createPost);
router.post('/:id/comments', authMiddleware, postController.createComment);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

router.put('/archive/:id', authMiddleware, verifyPostOwner, postController.archivePost);
router.put('/unarchive/:id', authMiddleware, verifyPostOwner, postController.unarchivePost);


module.exports = router;

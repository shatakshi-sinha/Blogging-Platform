const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reactionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, reactionController.reactToPost);
router.get('/:postId', reactionController.getPostReactions);

module.exports = router;
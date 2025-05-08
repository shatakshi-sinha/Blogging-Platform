const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);

// Protected routes (admin only)
router.post('/', authMiddleware, categoryController.createCategory);

module.exports = router;

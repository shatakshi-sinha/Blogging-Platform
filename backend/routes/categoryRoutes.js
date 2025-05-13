const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);

// Protected routes 
router.post('/', authMiddleware, categoryController.createCategory);

module.exports = router;

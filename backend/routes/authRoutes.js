const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', authController.register); // User registration
router.post('/login', authController.login); // User login

// Protected routes
router.get('/me', authMiddleware, authController.getMe); // Get authenticated user's info
router.get('/check', authMiddleware, authController.checkAuth); // Check if user is authenticated
router.delete('/delete', authMiddleware, authController.deleteUser ); // Delete user account

module.exports = router;

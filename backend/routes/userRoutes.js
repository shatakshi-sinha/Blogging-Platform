const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/:userId', userController.getPublicProfile);

// Protected routes (require authentication)
router.use(authMiddleware); // Apply auth middleware to all routes below

// Profile updates
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.put('/about', userController.updateAbout);

// Account management routes
router.route('/account')
  .get(userController.getUserAccount)    // GET /api/users/account
  .put(userController.updateProfile);    // PUT /api/users/account

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);

// Public routes
router.get('/:userId', userController.getPublicProfile);

// Protected routes (require authentication)
router.use(authMiddleware); // Apply auth middleware to all routes below

// Profile updates
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);

// Account management routes
router.route('/account')
  .get(userController.getUserAccount)    // GET /api/users/account
  .put(userController.updateAccount);    // PUT /api/users/account

  module.exports = router;

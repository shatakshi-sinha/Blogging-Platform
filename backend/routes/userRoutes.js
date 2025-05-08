const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');


// Public route
router.get('/:userId', userController.getPublicProfile);


// Protected routes
router.put('/profile', authMiddleware, userController.updateProfileInfo);
// Keep your existing password change route


module.exports = router;


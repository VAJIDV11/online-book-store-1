const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { asyncHandler } = require('../middleware/errorHandler');
const { isAuthenticated, isGuest } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidationRules, loginValidationRules } = require('../middleware/validator');

// Register routes
router.get('/register', isGuest, authController.getRegister);
router.post('/register', isGuest, authLimiter, registerValidationRules(), asyncHandler(authController.postRegister));

// Login routes
router.get('/login', isGuest, authController.getLogin);
router.post('/login', isGuest, authLimiter, loginValidationRules(), asyncHandler(authController.postLogin));

// Logout route
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

// User Profile route
router.get('/profile', isAuthenticated, asyncHandler(authController.getProfile));

module.exports = router;

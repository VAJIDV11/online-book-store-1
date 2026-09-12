const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { asyncHandler } = require('../middleware/errorHandler');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { checkoutValidationRules } = require('../middleware/validator');
const { generalLimiter } = require('../middleware/rateLimiter');

// Checkout routes (must be logged in)
router.get('/checkout', isAuthenticated, asyncHandler(orderController.getCheckout));
router.post('/checkout', isAuthenticated, generalLimiter, checkoutValidationRules(), asyncHandler(orderController.postCheckout));

// Order Success / Invoice
router.get('/order-success/:id', isAuthenticated, asyncHandler(orderController.getOrderSuccess));

module.exports = router;

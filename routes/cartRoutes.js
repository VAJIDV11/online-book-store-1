const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { asyncHandler } = require('../middleware/errorHandler');

// View Cart
router.get('/cart', asyncHandler(cartController.getCart));

// Add to Cart
router.post('/cart/add', asyncHandler(cartController.postAddToCart));

// Update Quantity
router.post('/cart/update', asyncHandler(cartController.postUpdateCart));

// Remove Item
router.post('/cart/remove', asyncHandler(cartController.postRemoveFromCart));

module.exports = router;

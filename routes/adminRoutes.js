const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { asyncHandler } = require('../middleware/errorHandler');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const { bookValidationRules } = require('../middleware/validator');

// All admin routes require Authentication AND Admin role
router.use(isAuthenticated, isAdmin);

// Dashboard overview
router.get('/', asyncHandler(adminController.getDashboard));
router.get('/dashboard', asyncHandler(adminController.getDashboard));

// Inventory management
router.get('/books', asyncHandler(adminController.getBooks));
router.get('/books/add', asyncHandler(adminController.getAddBook));
router.post('/books/add', bookValidationRules(), asyncHandler(adminController.postAddBook));
router.get('/books/edit/:id', asyncHandler(adminController.getEditBook));
router.post('/books/edit/:id', bookValidationRules(), asyncHandler(adminController.postEditBook));
router.post('/books/delete/:id', asyncHandler(adminController.postDeleteBook));

// Orders management
router.get('/orders', asyncHandler(adminController.getOrders));
router.post('/orders/update-status/:id', asyncHandler(adminController.postUpdateOrderStatus));

module.exports = router;

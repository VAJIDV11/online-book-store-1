const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { asyncHandler } = require('../middleware/errorHandler');

// Home page
router.get('/', asyncHandler(bookController.getHome));

// Catalogue page (filtering, search, pagination)
router.get('/catalogue', asyncHandler(bookController.getCatalogue));
router.get('/books', asyncHandler(bookController.getCatalogue));

// Book Detail page
router.get('/books/:id', asyncHandler(bookController.getBookDetail));

// Quick View AJAX API
router.get('/api/books/:id/quick-view', asyncHandler(bookController.getQuickView));

module.exports = router;

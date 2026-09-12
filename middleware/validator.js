const { body } = require('express-validator');

// Registration Validation Rules
const registerValidationRules = () => [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\s\-()]{7,20}$/).withMessage('Please enter a valid phone number.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.'),
  body('confirm_password')
    .notEmpty().withMessage('Please confirm your password.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    })
];

// Login Validation Rules
const loginValidationRules = () => [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
];

// Book CRUD Validation Rules (Admin)
const bookValidationRules = () => [
  body('title')
    .trim()
    .notEmpty().withMessage('Book title is required.')
    .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters.')
    .escape(),
  body('author')
    .trim()
    .notEmpty().withMessage('Author name is required.')
    .isLength({ max: 150 }).withMessage('Author name cannot exceed 150 characters.')
    .escape(),
  body('category_id')
    .notEmpty().withMessage('Please select a category.')
    .isInt({ min: 1 }).withMessage('Invalid category selected.'),
  body('isbn')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(97(8|9))?\d{9}(\d|X)$/i).withMessage('Invalid ISBN format (10 or 13 digits).'),
  body('description')
    .trim()
    .notEmpty().withMessage('Book description is required.')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long.'),
  body('price')
    .notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0.00.'),
  body('discount_price')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.00 }).withMessage('Discount price must be a valid positive amount.')
    .custom((value, { req }) => {
      if (value && parseFloat(value) >= parseFloat(req.body.price)) {
        throw new Error('Discount price must be lower than the standard price.');
      }
      return true;
    }),
  body('stock_quantity')
    .notEmpty().withMessage('Stock quantity is required.')
    .isInt({ min: 0 }).withMessage('Stock quantity cannot be negative.'),
  body('cover_image')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Cover image must be a valid URL.')
];

// Checkout Validation Rules
const checkoutValidationRules = () => [
  body('shipping_name')
    .trim()
    .notEmpty().withMessage('Recipient full name is required.')
    .escape(),
  body('shipping_email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('shipping_phone')
    .trim()
    .notEmpty().withMessage('Phone number is required.')
    .matches(/^[0-9+\s\-()]{7,20}$/).withMessage('Please enter a valid phone number.'),
  body('shipping_address')
    .trim()
    .notEmpty().withMessage('Shipping address is required.')
    .isLength({ min: 10 }).withMessage('Please provide a detailed address including street, city, and zip code.')
    .escape()
];

module.exports = {
  registerValidationRules,
  loginValidationRules,
  bookValidationRules,
  checkoutValidationRules
};

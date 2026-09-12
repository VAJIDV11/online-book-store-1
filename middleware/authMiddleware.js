const { pool } = require('../config/db');

/**
 * Middleware: Ensure user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to continue.');
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

/**
 * Middleware: Ensure user has admin privileges
 */
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied. Administrator privileges required.');
  res.redirect('/');
};

/**
 * Middleware: Ensure user is NOT logged in (for login & register pages)
 */
const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  next();
};

/**
 * Middleware: Attach global variables (user, cart count, flash messages) to all views
 */
const populateLocals = async (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.isAdmin = req.session.user && req.session.user.role === 'admin';
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;

  // Calculate live cart count
  let cartCount = 0;
  try {
    if (req.session.user) {
      const [rows] = await pool.execute(
        'SELECT SUM(quantity) AS totalItems FROM cart_items WHERE user_id = ?',
        [req.session.user.id]
      );
      cartCount = rows[0]?.totalItems || 0;
    } else if (req.session.cart && Array.isArray(req.session.cart)) {
      cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
  } catch (err) {
    // If DB is temporarily unavailable, fallback to session count
    if (req.session.cart && Array.isArray(req.session.cart)) {
      cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
  }
  res.locals.cartCount = cartCount;

  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isGuest,
  populateLocals
};

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

/**
 * Render Registration Page
 */
const getRegister = (req, res) => {
  res.render('pages/register', {
    pageTitle: 'Create an Account | Online Book Store',
    errors: [],
    formData: {}
  });
};

/**
 * Handle User Registration
 */
const postRegister = async (req, res) => {
  const errors = validationResult(req);
  const { full_name, email, password, phone, address } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).render('pages/register', {
      pageTitle: 'Create an Account | Online Book Store',
      errors: errors.array(),
      formData: { full_name, email, phone, address }
    });
  }

  // Check if user already exists
  const [existingUsers] = await pool.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (existingUsers.length > 0) {
    return res.status(409).render('pages/register', {
      pageTitle: 'Create an Account | Online Book Store',
      errors: [{ msg: 'An account with this email address already exists. Please log in.' }],
      formData: { full_name, email, phone, address }
    });
  }

  // Hash password securely with bcrypt (salt 10)
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Insert new user into database
  await pool.execute(
    'INSERT INTO users (full_name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
    [full_name, email, password_hash, 'user', phone || null, address || null]
  );

  req.flash('success', 'Registration successful! You can now log in to your account.');
  res.redirect('/login');
};

/**
 * Render Login Page
 */
const getLogin = (req, res) => {
  res.render('pages/login', {
    pageTitle: 'Sign In | Online Book Store',
    errors: [],
    formData: {}
  });
};

/**
 * Handle User Login
 */
const postLogin = async (req, res) => {
  const errors = validationResult(req);
  const { email, password, remember_me } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).render('pages/login', {
      pageTitle: 'Sign In | Online Book Store',
      errors: errors.array(),
      formData: { email }
    });
  }

  // Query user from MySQL
  const [users] = await pool.execute(
    'SELECT id, full_name, email, password_hash, role, phone, address FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (users.length === 0) {
    return res.status(401).render('pages/login', {
      pageTitle: 'Sign In | Online Book Store',
      errors: [{ msg: 'Invalid email or password.' }],
      formData: { email }
    });
  }

  const user = users[0];

  // Verify password with bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).render('pages/login', {
      pageTitle: 'Sign In | Online Book Store',
      errors: [{ msg: 'Invalid email or password.' }],
      formData: { email }
    });
  }

  // Session Fixation Protection: Regenerate session ID
  req.session.regenerate(async (err) => {
    if (err) {
      console.error('Session regeneration error:', err);
      req.flash('error', 'Login failed due to a session error. Please try again.');
      return res.redirect('/login');
    }

    // Set user session data
    req.session.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };

    // Handle "Remember Me" cookie maxAge (30 days vs standard session)
    if (remember_me) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
    }

    // Sync any items in guest session cart to database
    if (req.session.cart && req.session.cart.length > 0) {
      try {
        for (const item of req.session.cart) {
          await pool.execute(
            `INSERT INTO cart_items (user_id, book_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
            [user.id, item.book_id, item.quantity]
          );
        }
        delete req.session.cart;
      } catch (cartErr) {
        console.error('Error syncing guest cart to DB:', cartErr);
      }
    }

    req.flash('success', `Welcome back, ${user.full_name}!`);

    const redirectTo = req.session.returnTo || (user.role === 'admin' ? '/admin' : '/');
    delete req.session.returnTo;
    res.redirect(redirectTo);
  });
};

/**
 * Handle User Logout
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session during logout:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};

/**
 * Render User Profile & Order History
 */
const getProfile = async (req, res) => {
  const userId = req.session.user.id;

  // Get updated user profile info
  const [users] = await pool.execute(
    'SELECT id, full_name, email, role, phone, address, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    req.flash('error', 'User not found.');
    return res.redirect('/');
  }

  // Fetch user orders with item counts and details
  const [orders] = await pool.execute(
    `SELECT o.id, o.total_amount, o.shipping_address, o.payment_status, o.order_status, o.created_at,
            COUNT(oi.id) AS total_items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId]
  );

  res.render('pages/profile', {
    pageTitle: 'My Account & Orders | Online Book Store',
    user: users[0],
    orders
  });
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
  getProfile
};

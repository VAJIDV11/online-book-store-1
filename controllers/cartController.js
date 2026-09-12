const { pool } = require('../config/db');

/**
 * Helper: Calculate Cart Pricing (Subtotal, Shipping, Tax, Total)
 */
const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const effectivePrice = item.discount_price !== null && item.discount_price !== undefined
      ? parseFloat(item.discount_price)
      : parseFloat(item.price);
    return sum + (effectivePrice * item.quantity);
  }, 0);

  const shipping = subtotal > 50 || subtotal === 0 ? 0.00 : 4.99;
  const tax = subtotal * 0.05; // 5% standard sales tax
  const total = subtotal + shipping + tax;

  return {
    subtotal: subtotal.toFixed(2),
    shipping: shipping.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2)
  };
};

/**
 * Render Shopping Cart Page
 */
const getCart = async (req, res) => {
  let cartItems = [];

  if (req.session.user) {
    // Fetch from MySQL for logged in users
    const [rows] = await pool.execute(`
      SELECT ci.id AS cart_item_id, ci.quantity, ci.book_id,
             b.title, b.author, b.price, b.discount_price, b.cover_image, b.stock_quantity,
             c.name AS category_name
      FROM cart_items ci
      JOIN books b ON ci.book_id = b.id
      JOIN categories c ON b.category_id = c.id
      WHERE ci.user_id = ?
    `, [req.session.user.id]);
    cartItems = rows;
  } else {
    // Fetch from Session for guest users
    if (req.session.cart && req.session.cart.length > 0) {
      const bookIds = req.session.cart.map(item => item.book_id);
      if (bookIds.length > 0) {
        // Query book details for the session IDs
        const placeholders = bookIds.map(() => '?').join(',');
        const [rows] = await pool.execute(`
          SELECT b.id AS book_id, b.title, b.author, b.price, b.discount_price, b.cover_image, b.stock_quantity,
                 c.name AS category_name
          FROM books b
          JOIN categories c ON b.category_id = c.id
          WHERE b.id IN (${placeholders})
        `, bookIds);

        cartItems = rows.map(book => {
          const sessionItem = req.session.cart.find(item => item.book_id === book.book_id);
          return {
            ...book,
            quantity: sessionItem ? sessionItem.quantity : 1
          };
        });
      }
    }
  }

  const totals = calculateTotals(cartItems);

  res.render('pages/cart', {
    pageTitle: 'Shopping Cart | Online Book Store',
    cartItems,
    totals
  });
};

/**
 * Add Book to Cart (Form & AJAX friendly)
 */
const postAddToCart = async (req, res) => {
  const book_id = parseInt(req.body.book_id, 10);
  const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

  if (isNaN(book_id)) {
    req.flash('error', 'Invalid book selected.');
    return res.redirect('back');
  }

  // Check if book exists and is in stock
  const [books] = await pool.execute('SELECT id, title, stock_quantity FROM books WHERE id = ?', [book_id]);
  if (books.length === 0) {
    req.flash('error', 'The requested book does not exist.');
    return res.redirect('back');
  }

  const book = books[0];
  if (book.stock_quantity < 1) {
    req.flash('error', `Sorry, "${book.title}" is currently out of stock.`);
    return res.redirect('back');
  }

  if (req.session.user) {
    // Database storage for authenticated users
    await pool.execute(`
      INSERT INTO cart_items (user_id, book_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), ?)
    `, [req.session.user.id, book_id, quantity, book.stock_quantity]);
  } else {
    // Session storage for guest users
    if (!req.session.cart) {
      req.session.cart = [];
    }
    const existingIndex = req.session.cart.findIndex(item => item.book_id === book_id);
    if (existingIndex > -1) {
      req.session.cart[existingIndex].quantity = Math.min(
        req.session.cart[existingIndex].quantity + quantity,
        book.stock_quantity
      );
    } else {
      req.session.cart.push({ book_id, quantity: Math.min(quantity, book.stock_quantity) });
    }
  }

  // Handle AJAX requests
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.json({ success: true, message: `"${book.title}" added to cart!` });
  }

  req.flash('success', `"${book.title}" has been added to your cart.`);
  res.redirect('/cart');
};

/**
 * Update Cart Item Quantity
 */
const postUpdateCart = async (req, res) => {
  const book_id = parseInt(req.body.book_id, 10);
  const quantity = parseInt(req.body.quantity, 10);

  if (isNaN(book_id) || isNaN(quantity) || quantity < 1) {
    req.flash('error', 'Invalid quantity specified.');
    return res.redirect('/cart');
  }

  // Check available stock
  const [books] = await pool.execute('SELECT stock_quantity FROM books WHERE id = ?', [book_id]);
  if (books.length === 0) {
    req.flash('error', 'Book not found.');
    return res.redirect('/cart');
  }

  const maxStock = books[0].stock_quantity;
  const targetQuantity = Math.min(quantity, maxStock);

  if (req.session.user) {
    await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND book_id = ?',
      [targetQuantity, req.session.user.id, book_id]
    );
  } else if (req.session.cart) {
    const item = req.session.cart.find(i => i.book_id === book_id);
    if (item) {
      item.quantity = targetQuantity;
    }
  }

  req.flash('success', 'Cart updated successfully.');
  res.redirect('/cart');
};

/**
 * Remove Item from Cart
 */
const postRemoveFromCart = async (req, res) => {
  const book_id = parseInt(req.body.book_id, 10);

  if (isNaN(book_id)) {
    req.flash('error', 'Invalid item.');
    return res.redirect('/cart');
  }

  if (req.session.user) {
    await pool.execute(
      'DELETE FROM cart_items WHERE user_id = ? AND book_id = ?',
      [req.session.user.id, book_id]
    );
  } else if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.book_id !== book_id);
  }

  req.flash('success', 'Item removed from your cart.');
  res.redirect('/cart');
};

module.exports = {
  getCart,
  postAddToCart,
  postUpdateCart,
  postRemoveFromCart,
  calculateTotals
};

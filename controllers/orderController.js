const { validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { calculateTotals } = require('./cartController');

/**
 * Render Checkout Page
 */
const getCheckout = async (req, res) => {
  const userId = req.session.user.id;

  // Fetch cart items from DB
  const [cartItems] = await pool.execute(`
    SELECT ci.quantity, ci.book_id,
           b.title, b.author, b.price, b.discount_price, b.cover_image, b.stock_quantity
    FROM cart_items ci
    JOIN books b ON ci.book_id = b.id
    WHERE ci.user_id = ?
  `, [userId]);

  if (cartItems.length === 0) {
    req.flash('error', 'Your shopping cart is empty. Add some books before checking out!');
    return res.redirect('/catalogue');
  }

  // Fetch user profile defaults for shipping form
  const [users] = await pool.execute('SELECT full_name, email, phone, address FROM users WHERE id = ?', [userId]);
  const user = users[0] || {};

  const totals = calculateTotals(cartItems);

  res.render('pages/checkout', {
    pageTitle: 'Secure Checkout | Online Book Store',
    cartItems,
    totals,
    user,
    errors: [],
    formData: {
      shipping_name: user.full_name || '',
      shipping_email: user.email || '',
      shipping_phone: user.phone || '',
      shipping_address: user.address || ''
    }
  });
};

/**
 * Process Checkout & Place Order (Database Transaction)
 */
const postCheckout = async (req, res) => {
  const userId = req.session.user.id;
  const errors = validationResult(req);
  const { shipping_name, shipping_email, shipping_phone, shipping_address, payment_method } = req.body;

  // Fetch cart items
  const [cartItems] = await pool.execute(`
    SELECT ci.quantity, ci.book_id,
           b.title, b.author, b.price, b.discount_price, b.stock_quantity
    FROM cart_items ci
    JOIN books b ON ci.book_id = b.id
    WHERE ci.user_id = ?
  `, [userId]);

  if (cartItems.length === 0) {
    req.flash('error', 'Your cart is empty.');
    return res.redirect('/catalogue');
  }

  const totals = calculateTotals(cartItems);

  if (!errors.isEmpty()) {
    return res.status(422).render('pages/checkout', {
      pageTitle: 'Secure Checkout | Online Book Store',
      cartItems,
      totals,
      user: req.session.user,
      errors: errors.array(),
      formData: { shipping_name, shipping_email, shipping_phone, shipping_address }
    });
  }

  // Check stock availability for all items before starting transaction
  for (const item of cartItems) {
    if (item.stock_quantity < item.quantity) {
      req.flash('error', `Insufficient stock for "${item.title}". Only ${item.stock_quantity} left.`);
      return res.redirect('/cart');
    }
  }

  // Start MySQL Transaction
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert into orders table
    const [orderResult] = await connection.execute(`
      INSERT INTO orders (user_id, total_amount, shipping_name, shipping_email, shipping_phone, shipping_address, payment_method, payment_status, order_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Paid', 'Processing')
    `, [
      userId,
      totals.total,
      shipping_name,
      shipping_email,
      shipping_phone,
      shipping_address,
      payment_method || 'Credit/Debit Card (Simulated)'
    ]);

    const orderId = orderResult.insertId;

    // 2. Insert order items & reduce stock
    for (const item of cartItems) {
      const unitPrice = item.discount_price !== null && item.discount_price !== undefined
        ? parseFloat(item.discount_price)
        : parseFloat(item.price);

      await connection.execute(`
        INSERT INTO order_items (order_id, book_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.book_id, item.quantity, unitPrice]);

      // Deduct stock quantity
      await connection.execute(`
        UPDATE books SET stock_quantity = stock_quantity - ? WHERE id = ?
      `, [item.quantity, item.book_id]);
    }

    // 3. Clear the user's cart
    await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    // Commit transaction
    await connection.commit();
    connection.release();

    req.flash('success', 'Thank you for your order! Your payment has been processed successfully.');
    res.redirect(`/order-success/${orderId}`);

  } catch (txError) {
    await connection.rollback();
    connection.release();
    console.error('Order Transaction Failed:', txError);
    req.flash('error', 'There was a problem placing your order. Please try again.');
    res.redirect('/checkout');
  }
};

/**
 * Render Order Success / Receipt Page
 */
const getOrderSuccess = async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const userId = req.session.user.id;

  if (isNaN(orderId)) {
    return res.redirect('/');
  }

  // Fetch order header
  const [orders] = await pool.execute(`
    SELECT * FROM orders WHERE id = ? AND user_id = ?
  `, [orderId, userId]);

  if (orders.length === 0) {
    req.flash('error', 'Order not found.');
    return res.redirect('/profile');
  }

  const order = orders[0];

  // Fetch order line items
  const [items] = await pool.execute(`
    SELECT oi.*, b.title, b.author, b.cover_image
    FROM order_items oi
    JOIN books b ON oi.book_id = b.id
    WHERE oi.order_id = ?
  `, [orderId]);

  res.render('pages/order-success', {
    pageTitle: `Order Confirmation #${order.id} | Online Book Store`,
    order,
    items
  });
};

module.exports = {
  getCheckout,
  postCheckout,
  getOrderSuccess
};

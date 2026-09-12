const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

/**
 * Render Admin Dashboard with Key Metrics
 */
const getDashboard = async (req, res) => {
  // 1. Total Revenue
  const [revenueResult] = await pool.execute('SELECT SUM(total_amount) AS totalRevenue FROM orders WHERE payment_status = "Paid"');
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // 2. Total Orders Count
  const [ordersResult] = await pool.execute('SELECT COUNT(*) AS totalOrders FROM orders');
  const totalOrders = ordersResult[0]?.totalOrders || 0;

  // 3. Total Books Count
  const [booksResult] = await pool.execute('SELECT COUNT(*) AS totalBooks FROM books');
  const totalBooks = booksResult[0]?.totalBooks || 0;

  // 4. Total Customers Count
  const [usersResult] = await pool.execute('SELECT COUNT(*) AS totalUsers FROM users WHERE role = "user"');
  const totalUsers = usersResult[0]?.totalUsers || 0;

  // 5. Low Stock Alert Books (quantity <= 5)
  const [lowStockBooks] = await pool.execute(`
    SELECT b.id, b.title, b.author, b.stock_quantity, c.name AS category_name
    FROM books b
    JOIN categories c ON b.category_id = c.id
    WHERE b.stock_quantity <= 10
    ORDER BY b.stock_quantity ASC
    LIMIT 5
  `);

  // 6. Recent Orders
  const [recentOrders] = await pool.execute(`
    SELECT o.id, o.total_amount, o.shipping_name, o.payment_status, o.order_status, o.created_at
    FROM orders o
    ORDER BY o.created_at DESC
    LIMIT 6
  `);

  res.render('admin/dashboard', {
    pageTitle: 'Admin Dashboard | Online Book Store',
    stats: {
      totalRevenue: parseFloat(totalRevenue).toFixed(2),
      totalOrders,
      totalBooks,
      totalUsers
    },
    lowStockBooks,
    recentOrders
  });
};

/**
 * List all books for Admin inventory
 */
const getBooks = async (req, res) => {
  const [books] = await pool.execute(`
    SELECT b.*, c.name AS category_name
    FROM books b
    JOIN categories c ON b.category_id = c.id
    ORDER BY b.id DESC
  `);

  res.render('admin/books', {
    pageTitle: 'Manage Books Inventory | Admin Panel',
    books
  });
};

/**
 * Render Add Book Form
 */
const getAddBook = async (req, res) => {
  const [categories] = await pool.execute('SELECT id, name FROM categories ORDER BY name ASC');

  res.render('admin/book-form', {
    pageTitle: 'Add New Book | Admin Panel',
    isEdit: false,
    categories,
    book: {},
    errors: []
  });
};

/**
 * Handle Add New Book
 */
const postAddBook = async (req, res) => {
  const errors = validationResult(req);
  const { title, author, category_id, isbn, description, price, discount_price, stock_quantity, cover_image, is_featured } = req.body;

  const [categories] = await pool.execute('SELECT id, name FROM categories ORDER BY name ASC');

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/book-form', {
      pageTitle: 'Add New Book | Admin Panel',
      isEdit: false,
      categories,
      book: req.body,
      errors: errors.array()
    });
  }

  await pool.execute(`
    INSERT INTO books (title, author, category_id, isbn, description, price, discount_price, stock_quantity, cover_image, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    title,
    author,
    category_id,
    isbn || null,
    description,
    price,
    discount_price || null,
    stock_quantity,
    cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    is_featured === 'on' || is_featured === '1' ? 1 : 0
  ]);

  req.flash('success', `Book "${title}" was created successfully.`);
  res.redirect('/admin/books');
};

/**
 * Render Edit Book Form
 */
const getEditBook = async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  const [books] = await pool.execute('SELECT * FROM books WHERE id = ?', [bookId]);

  if (books.length === 0) {
    req.flash('error', 'Book not found.');
    return res.redirect('/admin/books');
  }

  const [categories] = await pool.execute('SELECT id, name FROM categories ORDER BY name ASC');

  res.render('admin/book-form', {
    pageTitle: `Edit "${books[0].title}" | Admin Panel`,
    isEdit: true,
    categories,
    book: books[0],
    errors: []
  });
};

/**
 * Handle Edit Book
 */
const postEditBook = async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  const errors = validationResult(req);
  const { title, author, category_id, isbn, description, price, discount_price, stock_quantity, cover_image, is_featured } = req.body;

  const [categories] = await pool.execute('SELECT id, name FROM categories ORDER BY name ASC');

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/book-form', {
      pageTitle: `Edit Book | Admin Panel`,
      isEdit: true,
      categories,
      book: { ...req.body, id: bookId },
      errors: errors.array()
    });
  }

  await pool.execute(`
    UPDATE books
    SET title = ?, author = ?, category_id = ?, isbn = ?, description = ?, price = ?, discount_price = ?, stock_quantity = ?, cover_image = ?, is_featured = ?
    WHERE id = ?
  `, [
    title,
    author,
    category_id,
    isbn || null,
    description,
    price,
    discount_price || null,
    stock_quantity,
    cover_image || null,
    is_featured === 'on' || is_featured === '1' ? 1 : 0,
    bookId
  ]);

  req.flash('success', `Book "${title}" was updated successfully.`);
  res.redirect('/admin/books');
};

/**
 * Handle Delete Book
 */
const postDeleteBook = async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  if (!isNaN(bookId)) {
    await pool.execute('DELETE FROM books WHERE id = ?', [bookId]);
    req.flash('success', 'Book deleted successfully.');
  }

  res.redirect('/admin/books');
};

/**
 * View All Orders
 */
const getOrders = async (req, res) => {
  const [orders] = await pool.execute(`
    SELECT o.*, u.email AS user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `);

  res.render('admin/orders', {
    pageTitle: 'Manage Orders | Admin Panel',
    orders
  });
};

/**
 * Update Order Status
 */
const postUpdateOrderStatus = async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { order_status } = req.body;

  const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!isNaN(orderId) && validStatuses.includes(order_status)) {
    await pool.execute('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, orderId]);
    req.flash('success', `Order #${orderId} status updated to "${order_status}".`);
  }

  res.redirect('/admin/orders');
};

module.exports = {
  getDashboard,
  getBooks,
  getAddBook,
  postAddBook,
  getEditBook,
  postEditBook,
  postDeleteBook,
  getOrders,
  postUpdateOrderStatus
};

const { pool } = require('../config/db');

/**
 * Render Home Page
 */
const getHome = async (req, res) => {
  // Fetch all categories with book counts
  const [categories] = await pool.execute(`
    SELECT c.*, COUNT(b.id) AS book_count
    FROM categories c
    LEFT JOIN books b ON c.id = b.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);

  // Fetch featured books
  const [featuredBooks] = await pool.execute(`
    SELECT b.*, c.name AS category_name, c.slug AS category_slug
    FROM books b
    JOIN categories c ON b.category_id = c.id
    WHERE b.is_featured = TRUE
    ORDER BY b.created_at DESC
    LIMIT 6
  `);

  // Fetch best sellers / top rated
  const [topRatedBooks] = await pool.execute(`
    SELECT b.*, c.name AS category_name, c.slug AS category_slug
    FROM books b
    JOIN categories c ON b.category_id = c.id
    ORDER BY b.rating DESC, b.rating_count DESC
    LIMIT 6
  `);

  // Fetch latest arrivals
  const [latestBooks] = await pool.execute(`
    SELECT b.*, c.name AS category_name, c.slug AS category_slug
    FROM books b
    JOIN categories c ON b.category_id = c.id
    ORDER BY b.created_at DESC
    LIMIT 6
  `);

  res.render('pages/home', {
    pageTitle: 'Online Book Store - Discover Your Next Favorite Read',
    categories,
    featuredBooks,
    topRatedBooks,
    latestBooks
  });
};

/**
 * Render Catalogue Page with Multi-Filtering, Searching, Sorting & Pagination
 */
const getCatalogue = async (req, res) => {
  const {
    q,
    category,
    min_price,
    max_price,
    rating,
    in_stock,
    sort = 'newest',
    page = 1
  } = req.query;

  const limit = 8;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * limit;

  // Build dynamic SQL query with parameterized values (Prevent SQL Injection)
  const whereConditions = [];
  const queryParams = [];

  // Search filter
  if (q && q.trim() !== '') {
    whereConditions.push('(b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.description LIKE ?)');
    const searchTerm = `%${q.trim()}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Category filter
  if (category && category !== 'all') {
    whereConditions.push('(c.slug = ? OR c.id = ?)');
    queryParams.push(category, category);
  }

  // Price range filters
  if (min_price && !isNaN(min_price)) {
    whereConditions.push('COALESCE(b.discount_price, b.price) >= ?');
    queryParams.push(parseFloat(min_price));
  }
  if (max_price && !isNaN(max_price)) {
    whereConditions.push('COALESCE(b.discount_price, b.price) <= ?');
    queryParams.push(parseFloat(max_price));
  }

  // Minimum rating filter
  if (rating && !isNaN(rating)) {
    whereConditions.push('b.rating >= ?');
    queryParams.push(parseFloat(rating));
  }

  // In-stock only filter
  if (in_stock === 'true' || in_stock === '1' || in_stock === 'on') {
    whereConditions.push('b.stock_quantity > 0');
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Sort direction mapping
  let orderClause = 'ORDER BY b.created_at DESC';
  switch (sort) {
    case 'price_asc':
      orderClause = 'ORDER BY COALESCE(b.discount_price, b.price) ASC';
      break;
    case 'price_desc':
      orderClause = 'ORDER BY COALESCE(b.discount_price, b.price) DESC';
      break;
    case 'rating_desc':
      orderClause = 'ORDER BY b.rating DESC, b.rating_count DESC';
      break;
    case 'title_asc':
      orderClause = 'ORDER BY b.title ASC';
      break;
    case 'newest':
    default:
      orderClause = 'ORDER BY b.created_at DESC';
      break;
  }

  // Count total matching books for pagination
  const countSql = `
    SELECT COUNT(*) AS total
    FROM books b
    JOIN categories c ON b.category_id = c.id
    ${whereClause}
  `;
  const [countResult] = await pool.execute(countSql, queryParams);
  const totalBooks = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalBooks / limit) || 1;

  // Fetch paginated books
  // Note: LIMIT and OFFSET in mysql2 prepared statements must be strictly integers
  const booksSql = `
    SELECT b.*, c.name AS category_name, c.slug AS category_slug
    FROM books b
    JOIN categories c ON b.category_id = c.id
    ${whereClause}
    ${orderClause}
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [books] = await pool.execute(booksSql, queryParams);

  // Fetch all categories for the filter sidebar
  const [categories] = await pool.execute(`
    SELECT c.*, COUNT(b.id) AS book_count
    FROM categories c
    LEFT JOIN books b ON c.id = b.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);

  res.render('pages/catalogue', {
    pageTitle: 'Book Catalogue | Online Book Store',
    books,
    categories,
    totalBooks,
    totalPages,
    currentPage,
    filters: {
      q: q || '',
      category: category || '',
      min_price: min_price || '',
      max_price: max_price || '',
      rating: rating || '',
      in_stock: in_stock || '',
      sort
    }
  });
};

/**
 * Render Book Detail Page
 */
const getBookDetail = async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  if (isNaN(bookId)) {
    return res.status(404).render('errors/404', {
      pageTitle: 'Book Not Found',
      path: req.originalUrl
    });
  }

  // Fetch main book details
  const [books] = await pool.execute(`
    SELECT b.*, c.name AS category_name, c.slug AS category_slug
    FROM books b
    JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
    LIMIT 1
  `, [bookId]);

  if (books.length === 0) {
    return res.status(404).render('errors/404', {
      pageTitle: 'Book Not Found',
      path: req.originalUrl
    });
  }

  const book = books[0];

  // Fetch related books from the same category
  const [relatedBooks] = await pool.execute(`
    SELECT b.*, c.name AS category_name, c.slug AS category_slug
    FROM books b
    JOIN categories c ON b.category_id = c.id
    WHERE b.category_id = ? AND b.id != ?
    LIMIT 4
  `, [book.category_id, book.id]);

  res.render('pages/book-detail', {
    pageTitle: `${book.title} | Online Book Store`,
    book,
    relatedBooks
  });
};

/**
 * AJAX API: Get Book Quick-View Data
 */
const getQuickView = async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  if (isNaN(bookId)) {
    return res.status(400).json({ success: false, message: 'Invalid Book ID.' });
  }

  const [books] = await pool.execute(`
    SELECT b.*, c.name AS category_name, c.slug AS category_slug
    FROM books b
    JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
    LIMIT 1
  `, [bookId]);

  if (books.length === 0) {
    return res.status(404).json({ success: false, message: 'Book not found.' });
  }

  res.json({
    success: true,
    book: books[0]
  });
};

module.exports = {
  getHome,
  getCatalogue,
  getBookDetail,
  getQuickView
};

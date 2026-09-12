const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection } = require('./config/db');
const { populateLocals } = require('./middleware/authMiddleware');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Security: Helmet HTTP headers configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://via.placeholder.com", "https://m.media-amazon.com", "https://covers.openlibrary.org", "https://*"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// Body Parsers & Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'bookstore_secure_session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours default
    }
  })
);

// Flash Notifications
app.use(flash());

// Attach Global Variables to Templates
app.use(populateLocals);

// Mount Routes
app.use('/admin', adminRoutes);
app.use('/', authRoutes);
app.use('/', bookRoutes);
app.use('/', cartRoutes);
app.use('/', orderRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server
async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Online Book Store server is running at http://localhost:${PORT}`);
    console.log(`📚 Admin credentials (default seed): admin@bookstore.com / Admin@12345`);
    console.log(`👤 Customer credentials (default seed): user@bookstore.com / User@12345`);
  });
}

startServer();

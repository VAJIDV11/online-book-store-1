const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Authentication routes (Login, Register)
 * Max 20 attempts per 15 minutes per IP to prevent brute-force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    req.flash('error', options.message.message);
    res.status(options.statusCode).redirect(req.originalUrl.includes('register') ? '/register' : '/login');
  }
});

/**
 * General API / Checkout Rate Limiter
 */
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  generalLimiter
};

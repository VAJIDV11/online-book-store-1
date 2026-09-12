/**
 * Global Async Handler Wrapper
 * Catches errors from async controller functions and forwards to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).render('errors/404', {
    pageTitle: '404 - Page Not Found',
    path: req.originalUrl
  });
};

/**
 * Centralized 500 Global Error Handler
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('🔥 Server Error:', err);

  const statusCode = err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';

  // If request is JSON / AJAX, return JSON error response
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'An unexpected server error occurred.',
      ...(isDev ? { stack: err.stack } : {})
    });
  }

  res.status(statusCode).render('errors/500', {
    pageTitle: '500 - Server Error',
    path: req.originalUrl,
    message: isDev ? err.message : 'Something went wrong on our end. Please try again later.',
    error: isDev ? err : null
  });
};

module.exports = {
  asyncHandler,
  notFoundHandler,
  globalErrorHandler
};

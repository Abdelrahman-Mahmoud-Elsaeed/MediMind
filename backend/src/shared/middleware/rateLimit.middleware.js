const rateLimit = require('express-rate-limit');

const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Increased allowance for real-time dashboard queries
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const url = req.originalUrl || req.url || req.path || '';
    return (
      url.includes('/socket.io') ||
      url.includes('/health') ||
      url === '/'
    );
  },
  message: {
    success: false,
    code: 'TOO_MANY_REQUESTS',
    messages: {
      en: 'Too many requests from this IP, please try again later.',
      ar: 'الكثير من الطلبات من هذا العنوان، يرجى المحاولة مرة أخرى لاحقاً.'
    }
  }
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const url = req.originalUrl || req.url || req.path || '';
    return url.includes('/socket.io');
  },
  message: {
    success: false,
    code: 'TOO_MANY_REQUESTS',
    messages: {
      en: 'Too many authentication attempts from this IP, please try again later.',
      ar: 'الكثير من محاولات تسجيل الدخول من هذا العنوان، يرجى المحاولة مرة أخرى لاحقاً.'
    }
  }
});

module.exports = {
  globalRateLimiter,
  authRateLimiter
};
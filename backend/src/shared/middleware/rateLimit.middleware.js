const rateLimit = require('express-rate-limit');

const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    success: false,
    status: 'TOO_MANY_REQUESTS',
    messages: {
      en: 'Too many requests from this IP, please try again later.',
      ar: 'الكثير من الطلبات من هذا العنوان، يرجى المحاولة مرة أخرى لاحقاً.'
    }
  }
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'TOO_MANY_REQUESTS',
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
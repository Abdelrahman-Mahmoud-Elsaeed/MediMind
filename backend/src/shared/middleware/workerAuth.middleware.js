const AppError = require('../utils/AppError');
const { WORKER_INTERNAL_SECRET } = require('../../config/env');

const verifyWorkerSecret = (req, res, next) => {
  const secret = req.headers['x-worker-secret'];
  const expectedSecret = WORKER_INTERNAL_SECRET || process.env.WORKER_INTERNAL_SECRET;
  if (!secret || secret !== expectedSecret) {
    return next(new AppError('Unauthorized internal access', 403, 'FORBIDDEN', {
      en: 'Unauthorized internal access attempt.',
      ar: 'محاولة وصول داخلي غير مصرح بها.'
    }));
  }
  next();
};

module.exports = { verifyWorkerSecret };

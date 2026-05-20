/**
 * Sanitizes object keys recursively, deleting any keys starting with $ or containing dots (.)
 * to block NoSQL Injection attempts.
 */
const clean = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        clean(obj[key]);
      }
    });
  }
};

export const sanitizeInput = (req, res, next) => {
  clean(req.body);
  clean(req.query);
  clean(req.params);
  next();
};

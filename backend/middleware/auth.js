const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    const err = new Error('Authentication required');
    err.status = 401;
    return next(err);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const err = new Error('Server misconfiguration');
      err.status = 500;
      return next(err);
    }
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch {
    const err = new Error('Invalid or expired token');
    err.status = 401;
    return next(err);
  }
}

module.exports = { authMiddleware };

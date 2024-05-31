const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errorHandler');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new UnauthorizedError('No token, authorization denied.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return next(new UnauthorizedError('Token is not valid.'));
  }
};

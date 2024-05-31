const { AppError, ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;

    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      // if (process.env.NODE_ENV !== 'production') {
      console.error(err.message);
      // console.error(err.stack);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
      error = new ValidationError(err.message || 'Validation error', err.details);
    }

    // Mongoose CastError (for invalid ObjectIds)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      error = new NotFoundError(`Resource not found with id: ${err.value} `);
    }

    // Handle duplicate key errors from MongoDB 
    if (err.code === 11000 && err.name === 'MongoServerError') {
      const key = Object.keys(err.keyValue)[0];
      error = new ValidationError(`Duplicate value entered for ${key}.It must be unique.`);
    }

    //  Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = new UnauthorizedError('Invalid token.');
    }

    if (err.name === 'TokenExpiredError') {
      error = new UnauthorizedError('Token expired.');
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
      details: error.details || {}, // Provide details for ValidationErrors 
    });

  } catch (error) {
    res.status(500).json({
      success: false, message: error.message || 'Server Error'
    });
  }
};

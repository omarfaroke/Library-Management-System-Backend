const errorTypes = require('./errorTypes');

class AppError extends Error {
  constructor(errorType, details = {}) {
    super(details?.message || errorTypes[errorType].message);

    this.name = this.constructor.name;
    this.statusCode = errorTypes[errorType].statusCode;
    this.message = details?.message || errorTypes[errorType].message;
    this.details = details;
    this.errorType = errorType;


    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super('ValidationError', { message, ...details });
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super('NotFoundError', { message });
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super('UnauthorizedError', { message });
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super('ForbiddenError', { message });
  }
}


module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};


const errorTypes = {
    ValidationError: {
        statusCode: 400,
        message: 'Validation Error',
    },
    NotFoundError: {
        statusCode: 404,
        message: 'Resource Not Found',
    },
    DuplicateKeyError: {
        statusCode: 409,
        message: 'Duplicate Key Error',
    },
    UnauthorizedError: {
        statusCode: 401,
        message: 'Unauthorized',
    },
    ForbiddenError: {
        statusCode: 403,
        message: 'Forbidden',
    },
    InternalServerError: {
        statusCode: 500,
        message: 'Internal Server Error',
    },
};

module.exports = errorTypes;
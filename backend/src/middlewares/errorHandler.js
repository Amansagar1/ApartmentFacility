const { HTTP_STATUS } = require('../utils/constants');

// ----------------Custom Error Class------------
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ----------------Global Express Error Handling Middleware------------
const globalErrorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (!statusCode) statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  if (!message) message = 'Something went wrong on the server.';

  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  if (err.code === 11000) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Duplicate field value entered. Please use another value.`;
  }

  if (err.name === 'ZodError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = err.errors.map(e => e.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { AppError, globalErrorHandler };

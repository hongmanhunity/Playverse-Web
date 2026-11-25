const env = require('../config/env');

const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';
  const code = err.code;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Dữ liệu không hợp lệ: ${err.path}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'trường dữ liệu';
    message = `Giá trị của ${field} đã tồn tại`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(code && typeof code === 'string' ? { code } : {}),
    stack: env.isProduction ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };

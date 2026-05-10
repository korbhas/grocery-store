const crypto = require('crypto');

function escapeLike(str) {
  return str.replace(/[%_\\]/g, '\\$&');
}

function paginate(query, page, limit) {
  const offset = (page - 1) * limit;
  return query.limit(limit).offset(offset);
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(err);
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    });
  };
}

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { escapeLike, paginate, asyncHandler, AppError, crypto };
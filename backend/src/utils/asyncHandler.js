/**
 * Async function handler to eliminate try-catch blocks in route handlers
 * @param {Function} fn Express route handler function
 * @returns {Function} Express route handler function with try-catch
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;

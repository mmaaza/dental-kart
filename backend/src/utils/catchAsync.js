/**
 * Wraps async controller functions to catch errors and forward them to Express error handler
 * @param {Function} fn - The async controller function to wrap
 * @returns {Function} Middleware function with error handling
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

module.exports = catchAsync;
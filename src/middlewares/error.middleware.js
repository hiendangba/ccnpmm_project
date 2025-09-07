const errorHandler = (err, req, res, next) => {
  console.error(err); // log ra console để debug
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errorCode: err.errorCode || "INTERNAL_ERROR",
  });
};

module.exports = errorHandler;
class AppError extends Error {
  constructor(error) {
    super(error.message);

    this.statusCode = error.statusCode;
    this.errorCode = error.errorCode;
  }
}

module.exports = AppError;
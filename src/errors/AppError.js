class AppError extends Error {
  constructor(error) {
    super(error.message);

    this.statusCode = error.statusCode;
    this.errorCode = error.errorCode;
  }
  static fromError(err) {
    return new AppError({
          message: err.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
          statusCode: err.statusCode || 500,
          errorCode: err.errorCode || "INTERNAL_ERROR"
      });
    }  
}

module.exports = AppError;
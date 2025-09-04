const UserError = {
  NOT_FOUND: {
    message: "User not found",
    statusCode: 404,
    errorCode: "USER_NOT_FOUND",
  },
  EMAIL_EXISTS: {
    message: "Email already exists",
    statusCode: 400,
    errorCode: "EMAIL_EXISTS",
  },
  MISSING_NAME: {
    message: "Name is required",
    statusCode: 400,
    errorCode: "MISSING_NAME",
  },
  MISSING_EMAIL: {
    message: "Email is required",
    statusCode: 400,
    errorCode: "MISSING_EMAIL",
  },
  MISSING_MSSV: {
    message: "MSSV is required",
    statusCode: 400,
    errorCode: "MISSING_MSSV",
  }
  ,
  MISSING_PASSWORD: {
    message: "Password is required",
    statusCode: 400,
    errorCode: "MISSING_PASSWORD",
  },
  INVALID_EMAIL: {
    message: "Invalid email format",
    statusCode: 400,
    errorCode: "INVALID_EMAIL",
  },
  INVALID_GENDER: {
    message: "Gender must be 'nam', 'nữ', or 'khác'",
    statusCode: 400,
    errorCode: "INVALID_GENDER",
  },
  PASSWORD_TOO_SHORT: {
    message: "Password must be at least 6 characters",
    statusCode: 400,
    errorCode: "PASSWORD_TOO_SHORT",
  },
  INVALID_AGE:{
    message: "Age must be a number between 18 and 100",
    statusCode: 400,
    errorCode: "INVALID_AGE",
  },
  BIO_TOO_LONG: {
    message: "Bio must not exceed 500 characters",
    statusCode: 400,
    errorCode: "BIO_TOO_LONG",
  },
  MSSV_EXISTS: {
    statusCode: 400,
    message: "MSSV đã tồn tại",
    errorCode: "MSSV_EXISTS"
  },
  REFRESH_TOKEN_EXPIRED: {
    statusCode: 401,
    message: "Refresh token đã hết hạn",
    errorCode: "REFRESH_TOKEN_EXPIRED"
  },
  REFRESH_TOKEN_INVALID: {
      statusCode: 401,
      message: "Refresh token không hợp lệ",
      errorCode: "REFRESH_TOKEN_INVALID"
  },
  REFRESH_TOKEN_ERROR: {
      statusCode: 500,
      message: "Có lỗi khi xử lý refresh token",
      errorCode: "REFRESH_TOKEN_ERROR"
  },
  OTP_INVALID_OR_EXPIRED: {
    message: "OTP is invalid or has expired",
    statusCode: 400,
    errorCode: "OTP_INVALID_OR_EXPIRED",
  },
  MSSV_NOT_FOUND: {
    message: "MSSV không tồn tại",
    statusCode: 404,
    errorCode: "MSSV_NOT_FOUND",
  },
  INVALID_PASSWORD: {
    message: "Sai mật khẩu",
    statusCode: 401,
    errorCode: "INVALID_PASSWORD",
  },
  INTERNAL_SERVER : {
    message: "Lỗi hệ thống. Không thể thực hiện hành động.",
    statusCode: 500,
    errorCode: "INTERNAL_SERVER"
  },
  INVALID_FLOWID: {
    message: "Phiên quên mật khẩu hết hạn hoặc không đúng.",
    statusCode: 400,
    errorCode: "INVALID_FLOWID"
  },
  OTP_MAX_ATTEMPTS: {
    message: "Vượt quá số lần thử OTP.",
    statusCode: 400,
    errorCode: "OTP_MAX_ATTEMPTS"
  },
  OTP_RESEND_MAX_ATTEMPTS: {
    message: "Vượt quá số lần gửi lại OTP.",
    statusCode: 400,
    errorCode: "OTP_RESEND_MAX_ATTEMPTS"
  },
  OTP_HASHED_NOT_FOUND: {
    message: "Lỗi không thể kiểm tra OTP.",
    statusCode: 400,
    errorCode: "OTP_HASHED_NOT_FOUND"
  },
  OTP_INCORRECT: {
    message: "OTP không chính xác.",
    statusCode: 400,
    errorCode: "OTP_INCORRECT"
  },
  INVALID_RESET_TOKEN_PURPOSE: {
    message: "Mục đích trong reset token không hợp lệ.",
    statusCode: 400,
    errorCode: "INVALID_RESET_TOKEN_PURPOSE"
  },
  INVALID_USER_INFO: {
    message: "Thông tin người dùng không hợp lệ.",
    statusCode: 400,
    errorCode: "INVALID_USER_INFO"
  },
};

module.exports = UserError;

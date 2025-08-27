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
  AGE_TOO_YOUNG: {
    message: "User must be at least 18 years old",
    statusCode: 400,
    errorCode: "AGE_TOO_YOUNG",
  },
  OTP_INVALID_OR_EXPIRED: {
    message: "OTP is invalid or has expired",
    statusCode: 400,
    errorCode: "OTP_INVALID_OR_EXPIRED",
  },
  OTP_NOT_MATCH: {
    message: "OTP does not match",
    statusCode: 400,
    errorCode: "OTP_NOT_MATCH",
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
};

module.exports = UserError;

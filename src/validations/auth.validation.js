const AppError = require("../errors/AppError");
const UserError = require("../errors/user.error.enum");

function authValidation(registerRequest) {
  const { name, email, password, mssv  } = registerRequest;

  // check name
  if (!name || name.trim() === "") {
    throw new AppError(UserError.MISSING_NAME);
  }

  // check email
  if (!email || email.trim() === "") {
    throw new AppError(UserError.MISSING_EMAIL);
  }

  if (!mssv || mssv.trim() === "") {
    throw new AppError(UserError.MISSING_MSSV);
  }
  
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new AppError(UserError.INVALID_EMAIL);
  }

  // check password
  if (!password) {
    throw new AppError(UserError.MISSING_PASSWORD);
  }
  if (password.length < 6) {
    throw new AppError(UserError.PASSWORD_TOO_SHORT);
  }
}

function validateFlowData(data) {
  if (!data || typeof data !== "object") {
    throw new AppError(UserError.INVALID_FLOWID);
  }

  // check userId
  if (!data.userId) {
    throw new AppError(UserError.INVALID_FLOWID);
  }

  // check attempts
  if (typeof data.attempts !== "number" || data.attempts < 0) {
    throw new AppError(UserError.INVALID_FLOWID);
  }

  // check maxAttempts
  if (typeof data.maxAttempts !== "number" || data.maxAttempts <= 0) {
    throw new AppError(UserError.INVALID_FLOWID);
  }

  // check resendCount
  if (typeof data.resendCount !== "number" || data.resendCount < 0) {
    throw new AppError(UserError.INVALID_FLOWID);
  }

  // check maxResends
    if (typeof data.maxResends !== "number" || data.maxResends <= 0) {
      throw new AppError(UserError.INVALID_FLOWID);
  }

  // check otpHashed
  if (!data.otpHashed || typeof data.otpHashed !== "string") {
    throw new AppError(UserError.OTP_HASHED_NOT_FOUND);
  }

  return data; // nếu ok thì return lại cho chắc
}

module.exports = {authValidation,validateFlowData};

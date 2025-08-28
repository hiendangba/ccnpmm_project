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

module.exports = authValidation;

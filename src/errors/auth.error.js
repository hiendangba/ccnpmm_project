const AuthError = {
  NO_TOKEN: {
    message: "Không có token, từ chối truy cập",
    statusCode: 401,
    errorCode: "NO_TOKEN"
  },
};

module.exports = AuthError;
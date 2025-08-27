class LoginRequestDTO {
  constructor(body) {
    this.mssv = body.mssv;
    this.password = body.password;
  }
}

class RegisterRequestDTO {
  constructor(body) {
    this.mssv = body.mssv;
    this.name = body.name;
    this.email = body.email;
    this.password = body.password;
    this.age = body.age;
    this.gender = body.gender;
    this.address = body.address;
  }
}

class VerifyOTP {
  constructor(body) {
    this.email = body.email;
    this.otp = body.otp;
  }
}

class ForgotPassword {
  constructor(body) {
    this.email = body.email;
  }
}

class VerifyOTPFB {
  constructor(body){
    this.flowId = body.flowId;
    this.otp = body.otp;
  }
}

class ResetPassword {
  constructor(body){
    this.newPassword = body.newPassword;
  }
}

module.exports = { LoginRequestDTO, RegisterRequestDTO, VerifyOTP, ForgotPassword, VerifyOTPFB, ResetPassword };
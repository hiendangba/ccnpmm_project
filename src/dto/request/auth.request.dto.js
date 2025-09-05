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
  }
}

class VerifyOTP {
  constructor(body) {
    this.flowId = body.flowId;
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
  constructor(body, resetPayload){
    this.newPassword = body.newPassword;
    this.resetPayload = resetPayload;
  }
}

class ResendOTP {
  constructor(body){
    this.flowId = body.flowId;
  }
}

module.exports = { LoginRequestDTO, RegisterRequestDTO, VerifyOTP, ForgotPassword, VerifyOTPFB, ResetPassword, ResendOTP };
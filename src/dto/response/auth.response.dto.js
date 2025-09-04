class LoginResponseDTO {
  constructor(user_id, token) {
    this.user_id = user_id;
    this.token = token
    }
}

class RegisterResponseDTO {
  constructor(result) {
    this.message = result.message;
    this.flowId = result.flowId;
    this.expiresIn = result.expiresIn;
  }
}

class VerifyResponseDTO {
  constructor(user) {
    this.id = user._id;   
    this.name = user.name;
    this.mssv = user.mssv;
    this.email = user.email;
    this.password = user.password;
  }
}

class ForgotPasswordResponseDTO {
  constructor(flowId, tryTime, message ){
    this.flowId = flowId,
    this.tryTime = tryTime,
    this.message = message
  }
}

class VerifyOTPFBResponseDTO {
  constructor(message){
    this.message = message
  }
}

class ResetPasswordResponseDTO {
  constructor(message){
    this.message = message
  }
}

class ResendOTPResponseDTO {
  constructor(message){
    this.message = message
  }
}


module.exports = { LoginResponseDTO, RegisterResponseDTO, VerifyResponseDTO, ForgotPasswordResponseDTO, VerifyOTPFBResponseDTO, ResetPasswordResponseDTO, ResendOTPResponseDTO };
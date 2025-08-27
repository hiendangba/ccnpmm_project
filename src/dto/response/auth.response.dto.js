class LoginResponseDTO {
  constructor(user_id, token, refreshToken) {
    this.user_id = user_id;
    this.token = token
    this.refreshToken = refreshToken
    }
}

class RegisterResponseDTO {
  constructor(message) {
    this.message = message;
  }
}

class VerifyResponseDTO {
  constructor(user) {
    this.id = user._id;   
    this.name = user.name;
    this.age = user.age;
    this.mssv = user.mssv;
    this.email = user.email;
    this.gender = user.gender;
    this.address = user.address;  
  }
}
module.exports = { LoginResponseDTO, RegisterResponseDTO, VerifyResponseDTO };
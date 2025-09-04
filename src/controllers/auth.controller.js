const authServices = require("../services/auth.service");
const { LoginRequestDTO, RegisterRequestDTO, VerifyOTP, ForgotPassword, VerifyOTPFB, ResetPassword, ResendOTP } = require("../dto/request/auth.request.dto");
const { ForgotPasswordResponseDTO, VerifyOTPFBResponseDTO, ResetPasswordResponseDTO, RegisterResponseDTO, VerifyResponseDTO, LoginResponseDTO, ResendOTPResponseDTO  } = require("../dto/response/auth.response.dto");

const authController = {
  register: async (req, res) => {
      try {
        const registerRequest = new RegisterRequestDTO(req.body);
        const result = await authServices.register(registerRequest);
        const registerResponseDTO = new RegisterResponseDTO(result);
        res.status(201).json(registerResponseDTO);
      } catch (err) {
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
      }
  },

  verifyOTP: async (req, res) => {
      try {
        const verifyOTP = new VerifyOTP(req.body);
        const user = await authServices.verifyOTP(verifyOTP);
        const verifyResponse = new VerifyResponseDTO(user);
        res.status(200).json(verifyResponse);
      } catch (err) {
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
      }
  },

  resendOTPRegister: async (req, res) => {
    try {
      const resendOTPRequest = new ResendOTP (req.body); 
      const response = await authServices.resendOTPRegister(resendOTPRequest);
      const result = new ResendOTPResponseDTO (response.message)
      res.status(200).json(result);
    }
    catch (err){
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }
  },

  login: async (req, res) => {
      try {
        const loginRequest = new LoginRequestDTO(req.body);
        const { user_id, token, refreshToken } = await authServices.login(loginRequest);
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'Strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });
        const loginResponse = new LoginResponseDTO(user_id, token);
        res.status(200).json(loginResponse);
      } catch (err) {
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
      }
  },

  refreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken; // lấy từ cookie
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }

      const { token } = await authServices.refreshToken(refreshToken);

      res.status(200).json({ token });
    } catch (err) {
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }
  },

  forgotPassword : async (req, res) => {
    try{
      const forgotPassRequest = new ForgotPassword(req.body)
      const flowId = await authServices.forgotPassword(forgotPassRequest);
      const forgotPassResponse = new ForgotPasswordResponseDTO (flowId, 3, "Mã OTP đã được gửi đến email của bạn vui lòng kiểm tra.")
      res.status(200).json(forgotPassResponse);
    } catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });  
    } 
  },

  verifyOtpFB : async (req, res) => {
    try{
      const verifyOtpRequest = new VerifyOTPFB(req.body);
      const resetToken =  await authServices.verifyOtpFB (verifyOtpRequest);
      res.cookie ('resetPass_token', resetToken, {
        httpOnly: true, 
        secure: false, 
        sameSite: 'strict', 
        maxAge: 10 * 60 * 1000 
      })
      const verifyOTPFBResponseDTO = new VerifyOTPFBResponseDTO ("Xác thực OTP thành công.");
      res.status(200).json(verifyOTPFBResponseDTO);
    }
    catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });  
    }
  },

  resetPassword : async (req, res) => {
    try{
      const resetPassRequest = new ResetPassword(req.body, req.resetPayload);
      await authServices.resetPassword(resetPassRequest);
      const result = new ResetPasswordResponseDTO ('Đặt lại mật khẩu thành công.')
      res.clearCookie('resetPass_token');
      res.status(200).json(result);
    }
    catch (err){
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }
  },

  resendOTP : async (req, res) => {
    try {
      const resendOTPRequest = new ResendOTP (req.body);
      await authServices.resendOTP(resendOTPRequest);
      const result = new ResendOTPResponseDTO ("Đã gửi lại OTP vào email của bạn.")
      res.status(200).json(result);
    }
    catch (err){
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }
  }

};

module.exports = authController;
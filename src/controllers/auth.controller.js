const authServices = require("../services/auth.service");
const { LoginRequestDTO, RegisterRequestDTO, VerifyOTP, ForgotPassword, VerifyOTPFB, ResetPassword } = require("../dto/request/auth.request.dto");

const authController = {
  register: async (req, res) => {
      try {
          const registerRequest = new RegisterRequestDTO(req.body);
          const message = await authServices.register(registerRequest);

          res.status(201).json({ message });
      } catch (err) {
          res.status(400).json({ message: err.message });
      }
  },

  verifyOTP: async (req, res) => {
      try {
          const verifyOTP = new VerifyOTP(req.body);
          const user = await authServices.verifyOTP(verifyOTP);
          res.status(200).json({ user });
      } catch (err) {
          res.status(400).json({ message: err.message });
      }
  },

  login: async (req, res) => {
    try {
      const loginRequest = new LoginRequestDTO(req.body);
      const { user_id, token } = await authServices.login(loginRequest);
      res.json({
        token,
        user_id: user_id
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  forgotPassword : async (req, res) => {
    try{
      const forgotPassRequest = new ForgotPassword(req.body)
      const flowId = await authServices.forgotPassword(forgotPassRequest);
      res.json({ flow_id: flowId, try_time: 3 , message: "Vui lòng kiểm tra email để lấy OTP xác thực."});
    } catch (err) {
      res.status(400).json({ message: "Hiện tại máy chủ đang bị lỗi." });  
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
      res.json({message: "OTP hợp lệ."});
    }
    catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  resetPassword : async (req, res) => {
    try{
      const resetPassRequest = new ResetPassword(req.body);
      const cookies = req.cookies;
      const result = await authServices.resetPassword(resetPassRequest, cookies);
      if (result) {
        // Xóa cookie
        res.clearCookie('resetPass_token');
        res.json({ message: 'Đặt lại mật khẩu thành công.' });
      }
      else {
        res.status(400).json({ message: 'Đặt lại mật khẩu thất bại.' });
      }
    }
    catch (err){
      res.status(400).json({ message: err.message });
    }
  },

};

module.exports = authController;
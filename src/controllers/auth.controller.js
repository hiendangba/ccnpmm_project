const authServices = require("../services/auth.service");
const { LoginRequestDTO, RegisterRequestDTO, VerifyOTP } = require("../dto/request/auth.request.dto");
const { LoginResponseDTO, RegisterResponseDTO, VerifyResponseDTO } = require("../dto/response/auth.response.dto");
const authController = {
  register: async (req, res) => {
      try {
        const registerRequest = new RegisterRequestDTO(req.body);
        const message = await authServices.register(registerRequest);
        const registerResponseDTO = new RegisterResponseDTO(message);
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

  login: async (req, res) => {
      try {
        const loginRequest = new LoginRequestDTO(req.body);
        const { user_id, token, refreshToken } = await authServices.login(loginRequest);
        const loginResponse = new LoginResponseDTO(user_id, token, refreshToken);
        res.status(200).json(loginResponse);
      } catch (err) {
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
      }
  }
};

module.exports = authController;
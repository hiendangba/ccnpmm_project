const authServices = require("../services/auth.service");
const { LoginRequestDTO, RegisterRequestDTO, VerifyOTP } = require("../dto/request/auth.request.dto");

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
  }
};

module.exports = authController;
const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/auth.controller");
const {checkPassTokenMiddleware } = require("../middlewares/auth.middleware");

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/verify-otp", authController.verifyOTP);
authRouter.post("/resendOTPRegister", authController.resendOTPRegister);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/verify-otpFP", authController.verifyOtpFB);
authRouter.post("/reset-password",checkPassTokenMiddleware, authController.resetPassword);
authRouter.post("/resend-OTP", authController.resendOTP);
authRouter.post("/refreshToken", authController.refreshToken);

module.exports = authRouter;

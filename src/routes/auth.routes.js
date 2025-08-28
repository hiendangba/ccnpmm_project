const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {checkPassTokenMiddleware } = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otpFP", authController.verifyOtpFB);
router.post("/reset-password",checkPassTokenMiddleware, authController.resetPassword);
router.post("/resend-OTP", authController.resendOTP);
module.exports = router;
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail  = require('../utils/mailer');
const generateOTP = require("../utils/generateOTP");
const redisClient = require("../utils/redisClient");
const verifyOTPUtil = require("../utils/verifyOTPUtil");
const { nanoid } = require('nanoid');
const { json } = require("express");
const { resetPassword } = require("../controllers/auth.controller");
const AppError = require("../errors/AppError");
const UserError = require("../errors/user.error.enum");
const authValidation = require("../validations/auth.validation");



const authServices = {
    register: async (registerRequest) => {

        const exists = await User.findOne({ email:registerRequest.email });

        if (exists) {
            throw new AppError(UserError.EMAIL_EXISTS);
        }

        //kiểm tra dữ liệu hợp lệ
        authValidation(registerRequest);  

        const otp = generateOTP();

        // Lưu OTP vào Redis
        await redisClient.set(`otp:${registerRequest.email}`, otp, { EX: 600 });
        // Lưu user tạm vào Redis
        await redisClient.set(`pendingUser:${registerRequest.email}`, JSON.stringify(registerRequest), { EX: 600 });
        
        sendMail({
            to: registerRequest.email,
            subject: "Chào mừng bạn đăng ký!",
            html: `
                <h3>Xin chào ${registerRequest.name}</h3>
                <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
                <p>Mã OTP của bạn là: <b>${otp}</b></p>
                <p>Mã OTP này sẽ hết hạn trong 10 phút.</p>
            `,
            });

        return  "OTP đã được gửi, vui lòng kiểm tra email";
    },


    verifyOTP: async(verifyOTP) =>{
        const storedOTP = await redisClient.get(`otp:${verifyOTP.email}`);
        if (!storedOTP) throw new AppError(UserError.OTP_INVALID_OR_EXPIRED);

        if (storedOTP !== verifyOTP.otp) throw new AppError(UserError.OTP_NOT_MATCH);

        const pendingUserData = await redisClient.get(`pendingUser:${verifyOTP.email}`);
        
        const pendingUser = JSON.parse(pendingUserData);
        const hashedPassword = await bcrypt.hash(pendingUser.password, 10);
        const newUser = new User({ ...pendingUser, password: hashedPassword });
       
        await newUser.save();

        // Xoá dữ liệu tạm thời khỏi Redis
        await redisClient.del(`otp:${verifyOTP.email}`);
        await redisClient.del(`pendingUser:${verifyOTP.email}`);

        return newUser;
    },

    login: async (loginRequest) => {
        const user = await User.findOne({ mssv: loginRequest.mssv });
        if (!user) throw new AppError(UserError.MSSV_NOT_FOUND);

        const isMatch = await bcrypt.compare(loginRequest.password, user.password);
        if (!isMatch) throw new AppError(UserError.INVALID_PASSWORD);

        const token = jwt.sign(
        { id: user._id, mssv: user.mssv },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
        );

        const refreshToken = jwt.sign(
            { id: user._id, mssv: user.mssv },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES}
        );
        return { user_id: user._id, token, refreshToken };
    },

    forgotPassword : async (forgotRequest) => {
        const user =  await User.findOne({ email : forgotRequest.email});
        const flowId = nanoid(24); 
        if (user){
            const otp = generateOTP();
            const otpHashed = await bcrypt.hash(otp, 10);  // salt la 10 
            const key = `fp:flow:${flowId}`;
            await redisClient.set(
                key,
                JSON.stringify({
                    userId: user.id,
                    otpHashed : otpHashed,
                    attempts: 0,
                    maxAttempts: 3,
                    resendCount: 0
                }),
                { EX: 600 }
            );
            await sendMail({
                to: user.email,
                subject: "Mật mã OTP, Quan trọng không chia sẽ cho người khác!",
                html: `
                    <h3>Xin chào ${user.name}</h3>
                    <p>Mã OTP của bạn là: <b>${otp}</b></p>
                    <p>Mã OTP này sẽ hết hạn trong 10 phút.</p>
                `,
            });
        }
        return flowId;
    },

    verifyOtpFB : async (verifyOtpRequest) =>{
        const {flowId, otp} = verifyOtpRequest;
        const key = `fp:flow:${flowId}`;
        const raw = await redisClient.get(key);
        if (!raw) throw new Error ("Phiên quên mật khẩu của bạn không hợp lệ hoặc đã hết.");

        const data = JSON.parse(raw);
        if (data.attempts > data.maxAttempts){
            throw new Error ("Vượt quá số lần thử OTP.");
        }

        if (!data.otpHashed) {
            throw new Error ("Lỗi không tìm thấy OTP");
        }

        const ok = await verifyOTPUtil (otp, data.otpHashed);
        if (!ok){
            data.attempts += 1;
            await redisClient.set(key, JSON.stringify(data), { EX: 600 });
            throw new Error ("OTP không chính xác.")
        }  

        delete data.otpHashed;
        await redisClient.set(key, JSON.stringify(data), { EX: 600 });
        const resetToken = jwt.sign(
            { sub: data.userId, flowId, purpose: "password_reset" },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );
        return resetToken;
    },

    resetPassword : async (resetPassRequest, cookies) => {
        const newPass = resetPassRequest.newPassword;
        const resetToken = cookies.resetPass_token;
        const payload = jwt.verify(resetToken, process.env.JWT_SECRET);
        if (payload.purpose != "password_reset") throw new Error("Mục đích trong reset token không hợp lệ.");
        const user =  await User.findOne({ _id : payload.sub});
        if (!user){
            throw new Error ("Thông tin người dùng không hợp lệ.");
        }
        const key = `fp:flow:${payload.flowId}`;
        const raw = await redisClient.get(key);
        if (!raw) throw new Error ("Phiên quên mật khẩu của bạn không hợp lệ hoặc đã hết."); 


        const passHashed = await bcrypt.hash(newPass, 10);
        
        const updateResult = await User.updateOne({ _id: payload.sub }, { password: passHashed});
        if (updateResult.modifiedCount === 0){
            return false;
        }
        else{
            await redisClient.del(key); 
            return true;
        }
    }, 



};
module.exports = authServices;
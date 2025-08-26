const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail  = require('../utils/mailer');
const generateOTP = require("../utils/generateOTP");
const redisClient = require("../utils/redisClient");
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
        if (!user) throw new Error("MSSV không tồn tại");

        const isMatch = await bcrypt.compare(loginRequest.password, user.password);
        if (!isMatch) throw new Error("Sai mật khẩu");

        const token = jwt.sign(
        { id: user._id, mssv: user.mssv },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
        );

        const refreshToken = jwt.sign(
        { id: user._id, mssv: user.mssv },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES}
    );
        return { user_id: user._id, token, refreshToken };
    }
};
module.exports = authServices;
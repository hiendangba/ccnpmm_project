const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail  = require('../utils/mailer');
const generateOTP = require("../utils/generateOTP");
const redisClient = require("../utils/redisClient");
const verifyOTPUtil = require("../utils/verifyOTPUtil");
const { nanoid } = require('nanoid');
const AppError = require("../errors/AppError");
const UserError = require("../errors/user.error.enum");
const {authValidation, validateFlowData} = require("../validations/auth.validation");
const elasticClient = require('../config/elastic.client');



const authServices = {
    register: async (registerRequest) => {
        try{
            const exists = await User.findOne({ email:registerRequest.email });

            const existsMssv = await User.findOne({ mssv:registerRequest.mssv });
            
            if (exists) {
                throw new AppError(UserError.EMAIL_EXISTS);
            }

            if (existsMssv) {
                throw new AppError(UserError.MSSV_EXISTS);
            }
            //kiểm tra dữ liệu hợp lệ
            authValidation(registerRequest);  
           
            // chuẩn hóa email
            registerRequest.email = registerRequest.email.toLowerCase().trim();

            const otp = generateOTP();
            const flowId = nanoid(24); 
            const otpHashed = await bcrypt.hash(otp, 10);
            const key = `register:flow:${flowId}`;

            // Lưu thông tin đăng ký và OTP đã hash vào Redis
            await redisClient.set(
                key,
                JSON.stringify({
                user: registerRequest,
                otpHashed,
                attempts: 0,
                maxAttempts: 3,
                resendCount: 0,
                maxResends: 3
                }),
                { EX: 600 } // 10 phút
            );

            await sendMail({
                to: registerRequest.email,
                subject: "Xác minh đăng ký tài khoản",
                html: `
                <h3>Xin chào ${registerRequest.name}</h3>
                <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
                <p>Mã OTP của bạn là: <b>${otp}</b></p>
                <p>Mã OTP này sẽ hết hạn trong 10 phút.</p>
                `,
            });
            return { message: "OTP đã được gửi, vui lòng kiểm tra email", flowId,   expiresIn: 600 };
        }catch (err){
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },


    verifyOTP: async(verifyOTP) =>{
        try{
            const key = `register:flow:${verifyOTP.flowId}`;

            // 1. Lấy data trong Redis
            const raw = await redisClient.get(key);
            if (!raw) {
                throw new AppError(UserError.OTP_INVALID_OR_EXPIRED);
            }

            const data = JSON.parse(raw);

            // 2. Check số lần nhập sai
            if (data.attempts >= data.maxAttempts) {
                throw new AppError(UserError.OTP_MAX_ATTEMPTS);
            }

            // 3. Verify OTP
            const ok = await bcrypt.compare(verifyOTP.otp, data.otpHashed);

            if (!ok) {
                data.attempts += 1;
                await redisClient.set(key, JSON.stringify(data), { EX: 600 }); // cập nhật lại
                throw new AppError(UserError.OTP_INCORRECT);
            }

            // 4. Tạo user chính thức
            const pendingUser = data.user;
            const hashedPassword = await bcrypt.hash(pendingUser.password, 10);
            const newUser = new User({
                ...pendingUser,
                password: hashedPassword
            });

            await newUser.save();
            await elasticClient.index({
                index: 'users',                  // tên index
                id: newUser._id.toString(),         // dùng _id MongoDB làm id
                body: {
                email: newUser.email,
                name: newUser.name,
                mssv: newUser.mssv,
                createdAt: newUser.createdAt.toISOString()
                }
            });
            await redisClient.del(key);

            return newUser;
        }catch (err){
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    resendOTPRegister : async (resendOTP) => {
        try{
            const key = `register:flow:${resendOTP.flowId}`;
            const raw = await redisClient.get(key);
            if (!raw) throw new AppError(UserError.INVALID_FLOWID);

            const data = JSON.parse(raw);

            if (data.resendCount >= data.maxResends) {
                await redisClient.del(key);
                throw new AppError(UserError.OTP_RESEND_MAX_ATTEMPTS);
            }

            const otp = generateOTP();
            const otpHashed = await bcrypt.hash(otp, 10);

            data.resendCount += 1;
            data.otpHashed = otpHashed;
            data.attempts = 0; // reset lại số lần nhập sai

            await sendMail({
                to: data.user.email,
                subject: "Xác minh đăng ký tài khoản",
                html: `
                    <h3>Xin chào ${data.user.name}</h3>
                    <p>Mã OTP của bạn là: <b>${otp}</b></p>
                    <p>Mã OTP này sẽ hết hạn trong 10 phút.</p>
                `,
            });

            const ttl = await redisClient.ttl(key);

            if (ttl > 0) {
                await redisClient.set(key, JSON.stringify(data), { EX: ttl });
            } else {
                // fallback: nếu TTL = -1 (không có expire) thì đặt lại 600s
                await redisClient.set(key, JSON.stringify(data), { EX: 600 });
            }
            return { message: "OTP mới đã được gửi" };
        }catch(err){
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
        
    },

    login: async (loginRequest) => {
        try
        {
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

            await redisClient.set(
                `refresh:${user._id}`,
                refreshToken,
                "EX",
                7 * 24 * 60 * 60 // 7 ngày
            );
            return { user_id: user._id, token, refreshToken };
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    refreshToken: async (refreshToken) => {
        try {
            // 1. Xác thực refreshToken
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // 2. Kiểm tra refreshToken trong Redis
            const savedToken = await redisClient.get(`refresh:${decoded.id}`);
            if (!savedToken || savedToken !== refreshToken) {
                throw new AppError(UserError.REFRESH_TOKEN_INVALID);
            }

            // 3. Tạo access token mới
            const newAccessToken = jwt.sign(
                { id: decoded.id, mssv: decoded.mssv },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            );

            return { token: newAccessToken };
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    forgotPassword : async (forgotRequest) => {
        try{
            const flowId = nanoid(24); 
            const user =  await User.findOne({ email : forgotRequest.email});
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
                        resendCount: 0,
                        maxResends: 3
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
        }
        catch (err){
            console.error("ERROR:", err);
            throw new AppError(UserError.INTERNAL_SERVER);
        }
    },

    verifyOtpFB : async (verifyOtpRequest) =>{
        try{
            const {flowId, otp} = verifyOtpRequest;
            const key = `fp:flow:${flowId}`;
            const raw = await redisClient.get(key);
            if (!raw) throw new AppError (UserError.INVALID_FLOWID);

            const data = validateFlowData(JSON.parse(raw));
            
            
            if (data.attempts >= data.maxAttempts){
                throw new AppError (UserError.OTP_MAX_ATTEMPTS);
            }

            const ok = await verifyOTPUtil (otp, data.otpHashed);
            if (!ok){
                data.attempts += 1;
                await redisClient.set(key, JSON.stringify(data), { EX: 600 });
                throw new AppError (UserError.OTP_INCORRECT);
            }  

            delete data.otpHashed;
            await redisClient.set(key, JSON.stringify(data), { EX: 600 });
            const resetToken = jwt.sign(
                { sub: data.userId, flowId, purpose: "password_reset" },
                process.env.JWT_SECRET,
                { expiresIn: "10m" }
            );
            return resetToken;
        }
        catch (err){
            console.error("ERROR:", err);
            if (err instanceof AppError) throw err;
            throw new AppError(UserError.INTERNAL_SERVER);
        }  
    },

    resetPassword : async (resetPassRequest) => {
        try{
            const {newPassword, resetPayload} = resetPassRequest;
            if (resetPayload.purpose != "password_reset") throw new AppError (UserError.INVALID_RESET_TOKEN_PURPOSE);
            const user =  await User.findOne({ _id : resetPayload.sub});
            if (!user){
                throw new AppError (UserError.INVALID_USER_INFO);
            }
            const key = `fp:flow:${resetPayload.flowId}`;
            const raw = await redisClient.get(key);
            if (!raw) throw new AppError (UserError.INVALID_FLOWID);


            const passHashed = await bcrypt.hash(newPassword, 10);
            
            await User.updateOne({ _id: user.id }, { password: passHashed});
            await redisClient.del(key); 
            return;
            
        }
        catch (err){
            console.error("ERROR:", err);
            if (err instanceof AppError) throw err;
            throw new AppError(UserError.INTERNAL_SERVER);
        }
    }, 

    resendOTP : async (resendOTPRequest) => {
        try{
            const {flowId} = resendOTPRequest;
            const key = `fp:flow:${flowId}`;
            const raw = await redisClient.get(key);
            if (!raw) throw new AppError (UserError.INVALID_FLOWID);

            const data = validateFlowData(JSON.parse(raw));

            if (data.resendCount >= data.maxResends){
                await redisClient.del(key);
                throw new AppError(UserError.OTP_RESEND_MAX_ATTEMPTS);
            }

            const user = await User.findOne({_id : data.userId});
            if (!user){
                throw new AppError(UserError.INVALID_USER_INFO);
            }

            if (!user.email){
                throw new AppError(UserError.INVALID_EMAIL);
            }

            const otp = generateOTP();
            const otpHashed = await bcrypt.hash(otp, 10);

            data.resendCount += 1;
            data.otpHashed  = otpHashed;
            data.attempts = 0;

            await sendMail({
                to: user.email,
                subject: "Mật mã OTP, Quan trọng không chia sẽ cho người khác!",
                html: `
                    <h3>Xin chào ${user.name}</h3>
                    <p>Mã OTP của bạn là: <b>${otp}</b></p>
                    <p>Mã OTP này sẽ hết hạn trong 10 phút.</p>
                `,
            });
        
            await redisClient.set(key, JSON.stringify(data), { EX: 600 });

            return;

        }
        catch(err){
            console.error("ERROR: ", err);
            if (err instanceof AppError) throw err;
            throw new AppError (UserError.INTERNAL_SERVER);
        }
    }

};
module.exports = authServices;
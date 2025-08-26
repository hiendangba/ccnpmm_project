const bcrypt = require("bcryptjs");

const verifyOTP =  async function (otp, otpHashed) {
    return bcrypt.compare(otp,otpHashed);
}

module.exports = verifyOTP;
const authRouter = require("./auth.routes");
const userRouter = require("./user.route");

module.exports = (app) => {
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
};
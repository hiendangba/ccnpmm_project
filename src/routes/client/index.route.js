const authRouter = require("./auth.routes");
const messageRouter = require("./message.route");
const userRouter = require("./user.route");

module.exports = (app) => {
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/message", messageRouter)
};
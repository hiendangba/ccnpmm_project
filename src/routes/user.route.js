const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/user.controller");
const {authMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware"); // multer memoryStorage

userRouter.get("/profile", authMiddleware,  userController.getProfile);
userRouter.put("/profile", authMiddleware, upload.single("avatar"),userController.updateProfile);
module.exports = userRouter;


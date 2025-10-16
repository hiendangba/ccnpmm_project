const express = require("express");
const messageRouter = express.Router();
const messageController = require("../../controllers/message.controller");
const {authMiddleware } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware"); // multer memoryStorage

messageRouter.get("/one-to-one", authMiddleware,  messageController.getMessageOneToOne);
messageRouter.get("/group",authMiddleware,messageController.getMessageGroup);
messageRouter.post("/sendMessage",authMiddleware, upload.single("attachments"),messageController.sendMessage);
messageRouter.post("/createGroup",authMiddleware, upload.single("avatarGroup"),messageController.createGroup);
messageRouter.patch("/:id/read",authMiddleware, messageController.markAsRead);

//Hàm load lên tất cả cuộc trò chuyện bao gồm cả tin nhắn cuối có ai trong cuộc trò chuyện....
messageRouter.get("/conversation",authMiddleware, messageController.conversation);
messageRouter.patch("/:id/call", authMiddleware, messageController.updateCallStatus);

module.exports = messageRouter;
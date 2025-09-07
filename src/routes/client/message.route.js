const express = require("express");
const messageRouter = express.Router();
const messageController = require("../../controllers/message.controller");
const {authMiddleware } = require("../../middlewares/auth.middleware");

messageRouter.get("/one-to-one", authMiddleware,  messageController.getMessageOneToOne);
messageRouter.get("/getConversationID",authMiddleware,messageController.getConversationID)
messageRouter.post("/sendMessage",authMiddleware, messageController.sendMessage);
messageRouter.post("/createGroup",authMiddleware, messageController.createGroup);
messageRouter.patch("/:id/read",authMiddleware, messageController.markAsRead);

module.exports = messageRouter;
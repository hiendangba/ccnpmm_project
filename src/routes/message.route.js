const express = require("express");
const messageRouter = express.Router();
const messageController = require("../controllers/message.controller");
const {authMiddleware } = require("../middlewares/auth.middleware");

messageRouter.get("/one-to-one", authMiddleware,  messageController.getOrCreateOneToOne);

module.exports = messageRouter;
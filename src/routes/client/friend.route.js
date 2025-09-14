const express = require("express");
const friendRouter = express.Router();
const {authMiddleware } = require("../../middlewares/auth.middleware");
const friendController = require("../../controllers/friend.controller");

friendRouter.post("/request", authMiddleware, friendController.sendRequest)
friendRouter.post("/accept", authMiddleware, friendController.acceptRequest)
friendRouter.post("/reject", authMiddleware, friendController.rejectRequest)
friendRouter.delete("/cancel", authMiddleware, friendController.cancelRequest)
friendRouter.delete("/remove", authMiddleware, friendController.removeFriend)

friendRouter.get("/requests", authMiddleware, friendController.getRequest)
friendRouter.get("/list", authMiddleware, friendController.getListFriend)

module.exports = friendRouter;
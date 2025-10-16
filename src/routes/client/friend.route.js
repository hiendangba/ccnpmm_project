const express = require("express");
const friendRouter = express.Router();
const {authMiddleware } = require("../../middlewares/auth.middleware");
const friendController = require("../../controllers/friend.controller");

friendRouter.post("/request", authMiddleware, friendController.sendRequest)
friendRouter.post("/accept", authMiddleware, friendController.acceptRequest)
friendRouter.post("/reject", authMiddleware, friendController.rejectRequest)
friendRouter.delete("/cancel/:requestId", authMiddleware, friendController.cancelRequest);
friendRouter.delete("/remove/:requestId", authMiddleware, friendController.removeFriend)
friendRouter.get("/requests/sent", authMiddleware, friendController.getSentRequest)
friendRouter.get("/requests/received", authMiddleware, friendController.getReceivedRequest)
friendRouter.get("/list", authMiddleware, friendController.getListFriend)
friendRouter.get("/search", authMiddleware, friendController.searchListFriend)
module.exports = friendRouter;
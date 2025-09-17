const express = require("express");
const route = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { loadListPostMiddleware, likePostMiddleware } = require("../../middlewares/post.middleware");
const postController = require("../../controllers/post.controller");

route.get("/getAll", authMiddleware, loadListPostMiddleware,  postController.getAllPost);
route.post("/likePost", authMiddleware, likePostMiddleware , postController.likePost);

module.exports = route;
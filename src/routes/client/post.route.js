const express = require("express");
const route = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { loadListPostMiddleware, likePostMiddleware, commentPostMiddleware, handleImages, sharePostMiddleware } = require("../../middlewares/post.middleware");
const postController = require("../../controllers/post.controller");
const upload = require("../../middlewares/upload.middleware"); // multer memoryStorage

route.get("/getAll", authMiddleware, loadListPostMiddleware,  postController.getAllPost);
route.post("/likePost", authMiddleware, likePostMiddleware , postController.likePost);
route.post("/commentPost", authMiddleware, upload.array("images") , handleImages, commentPostMiddleware, postController.commentPost );
route.post("/sharePost", authMiddleware, sharePostMiddleware, postController.sharePost  );
route.delete("/deleteComment/:id", authMiddleware, postController.deleteComment);
module.exports = route;
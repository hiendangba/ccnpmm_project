const express = require("express");
const userRouter = express.Router();
const userController = require("../../controllers/user.controller");
const { authMiddleware, requireRole } = require("../../middlewares/auth.middleware");
const { validatePost, handleImages } = require("../../middlewares/post.middleware");
const upload = require("../../middlewares/upload.middleware"); // multer memoryStorage

// ========== USER ROUTES ==========
userRouter.get("/profile", authMiddleware,  userController.getProfile);
userRouter.get("/all", authMiddleware, userController.getAllUsers);
userRouter.put("/profile", authMiddleware, upload.single("avatar"),userController.updateProfile);
userRouter.post("/postNew", authMiddleware, upload.array("images") , handleImages, validatePost, userController.postNew);
userRouter.get("/find-user", authMiddleware, userController.searchUser);

// ========== MANAGEMENT ROUTES ==========
// Dashboard
userRouter.get("/management/dashboard", authMiddleware, requireRole(['admin']), userController.managementGetDashboardStats);

// User Management
userRouter.get("/management/users", authMiddleware, requireRole(['admin']), userController.managementGetAllUsers);
userRouter.get("/management/users/stats", authMiddleware, requireRole(['admin']), userController.managementGetUserStatsByRole);
userRouter.get("/management/users/:id", authMiddleware, requireRole(['admin']), userController.managementGetUserById);
userRouter.put("/management/users/:id/role", authMiddleware, requireRole(['admin']), userController.managementUpdateUserRole);
userRouter.delete("/management/users/:id", authMiddleware, requireRole(['admin']), userController.managementDeleteUser);
userRouter.post("/management/users/:id/restore", authMiddleware, requireRole(['admin']), userController.managementRestoreUser);

// Elasticsearch Management
userRouter.get("/management/elasticsearch/status", authMiddleware, requireRole(['admin']), userController.managementGetElasticsearchStatus);
userRouter.post("/management/elasticsearch/sync", authMiddleware, requireRole(['admin']), userController.managementSyncElasticsearch);
userRouter.post("/management/elasticsearch/reconnect", authMiddleware, requireRole(['admin']), userController.managementReconnectElasticsearch);

module.exports = userRouter;


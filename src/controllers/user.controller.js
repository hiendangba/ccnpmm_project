const userService = require("../services/user.service");
const userManagementServices = require("../services/userManagement.service");
const elasticsearchService = require("../services/elasticsearch.service");
const UserResponse = require("../dto/response/user.response.dto");
const { UpdateUserRequest, PostNewRequest } = require("../dto/request/user.request.dto");
const { PostResponse } = require("../dto/response/post.response.dto");
const CloudinaryError = require("../errors/cloudinary.error");
const cloudinary = require("../config/cloudinary");
const AppError = require("../errors/AppError");
const { getIO } = require("../config/socket");
const ApiResponse = require("../dto/response/api.response.dto")

const userController = {
  getProfile: async (req, res) => {
    try {
      const result = new UserResponse(await userService.getProfile(req.user));
      res.status(200).json(result);
    } catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const updateRequest = new UpdateUserRequest(req.body);

      let avatarUrl = null;
      if (req.file) {
        avatarUrl = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
              if (error) return reject(new AppError(CloudinaryError.CLOUD_UPLOAD_ERROR));
              resolve(result.secure_url);
            }
          ).end(req.file.buffer); // dùng buffer của multer
        });
      }

      const result = new UserResponse(await userService.updateProfile(updateRequest, avatarUrl, req.user.id));
      res.status(200).json(result);
    } catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    };
  },

  getAllUsers: async (req, res) => {
    try {
      const senderId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search || ""; // keyword tìm kiếm
      const { users, total } = await userService.getAllUsers(page, limit, search, senderId);

      const listUserResponse = users.map(user => new UserResponse(user));
      res.status(200).json({ users: listUserResponse, total });

    } catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    };
  },

  postNew: async (req, res) => {
    try {
      const postNewRequest = new PostNewRequest(req.body);
      const savedPost = await userService.postNew(postNewRequest);
      const postDTO = new PostResponse(savedPost, req.user.id);

      const io = getIO();
      io.emit("USER_UPLOAD_POST", postDTO);

      const result = { message: "Đăng bài thành công.", post: postDTO }
      res.status(200).json(result); // trong try thi luon luon tra ve trang thai la thanh cong
    }
    catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode }) // tat ca cac loi quang ra day tra ve
    }
  },

  searchUser: async (req, res) => {
    try {
      const senderId = req.user.id;
      const search = req.query.search || ""; // keyword tìm kiếm
      const users = await userService.searchUser(senderId, search)
      res.status(200).json(new ApiResponse({ users: users.map(u => new UserResponse(u)) }));
    }
    catch (err) {
      //res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode }) // tat ca cac loi quang ra day tra ve
      res.status(err.statusCode || 500).json({
        message: err.message,
        status: err.statusCode || 500,
        errorCode: err.errorCode || 'INTERNAL_ERROR'
      });
    }
  },

  // ========== MANAGEMENT FUNCTIONS ==========

  // GET /api/user/management/users - Lấy danh sách users (admin only)
  managementGetAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', role = '' } = req.query;
      const result = await userManagementServices.getAllUsersForAdmin(
        parseInt(page),
        parseInt(limit),
        search,
        role
      );
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // GET /api/user/management/users/:id - Lấy thông tin chi tiết user (admin only)
  managementGetUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userManagementServices.getUserByIdForAdmin(id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // PUT /api/user/management/users/:id/role - Cập nhật role của user (admin only)
  managementUpdateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role is required'
        });
      }

      const user = await userManagementServices.updateUserRole(id, role);
      res.json({
        success: true,
        data: user,
        message: 'User role updated successfully'
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // DELETE /api/user/management/users/:id - Xóa user (admin only)
  managementDeleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await userManagementServices.deleteUser(id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // POST /api/user/management/users/:id/restore - Khôi phục user đã bị xóa (admin only)
  managementRestoreUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userManagementServices.restoreUser(id);
      res.json({
        success: true,
        data: user,
        message: 'User restored successfully'
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // GET /api/user/management/users/stats - Lấy thống kê users theo role (admin only)
  managementGetUserStatsByRole: async (req, res) => {
    try {
      const stats = await userManagementServices.getUserStatsByRole();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // GET /api/user/management/dashboard - Lấy thống kê tổng quan (admin only)
  managementGetDashboardStats: async (req, res) => {
    try {
      const stats = await userManagementServices.getDashboardStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // ========== ELASTICSEARCH MANAGEMENT ==========

  // GET /api/user/management/elasticsearch/status - Kiểm tra trạng thái Elasticsearch
  managementGetElasticsearchStatus: async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          isConnected: elasticsearchService.isConnected,
          message: elasticsearchService.isConnected ? 'Elasticsearch is connected' : 'Elasticsearch is not available'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // POST /api/user/management/elasticsearch/sync - Đồng bộ data từ MongoDB sang Elasticsearch
  managementSyncElasticsearch: async (req, res) => {
    try {
      await elasticsearchService.syncAllData();
      res.json({
        success: true,
        message: 'Data synchronization completed'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // POST /api/user/management/elasticsearch/reconnect - Thử kết nối lại Elasticsearch
  managementReconnectElasticsearch: async (req, res) => {
    try {
      await elasticsearchService.reconnect();
      res.json({
        success: true,
        data: {
          isConnected: elasticsearchService.isConnected,
          message: elasticsearchService.isConnected ? 'Reconnected successfully' : 'Reconnection failed'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = userController;
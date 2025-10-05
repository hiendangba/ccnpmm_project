const userService = require("../services/user.service");
const UserResponse = require("../dto/response/user.response.dto");
const {UpdateUserRequest, PostNewRequest} = require("../dto/request/user.request.dto");
const { PostResponse } = require("../dto/response/post.response.dto");
const CloudinaryError = require("../errors/cloudinary.error");
const cloudinary = require("../config/cloudinary");
const AppError = require("../errors/AppError");
const { getIO } = require("../config/socket");
const ApiResponse = require("../dto/response/api.response.dto");
const userServices = require("../services/user.service");
  

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
      const {users, total} = await userService.getAllUsers(page, limit, search, senderId);

      const listUserResponse = users.map(user => new UserResponse(user));
      res.status(200).json({users: listUserResponse, total});

    }catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    };
  },

  postNew: async (req, res) => {
    try{
      const postNewRequest = new PostNewRequest(req.body);
      const savedPost = await userService.postNew(postNewRequest);
      const postDTO = new PostResponse (savedPost, req.user.id);

      const io = getIO();
      io.emit("USER_UPLOAD_POST", postDTO);

      const result = { message: "Đăng bài thành công.", post : postDTO }
      res.status(200).json(result); // trong try thi luon luon tra ve trang thai la thanh cong
    }
    catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode }) // tat ca cac loi quang ra day tra ve
    }
  },

  searchUser: async (req, res) => {
    try{
      const senderId = req.user.id;
      const search = req.query.search || ""; // keyword tìm kiếm
      const users = await userService.searchUser(senderId, search)
      res.status(200).json(new ApiResponse({users: users.map(u => new UserResponse(u))}));
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

  getUserProfie: async (req, res) => {
    try{
      // auto thanh cong
      const { userId } = req.query;
      const userResponseDTO = await userServices.getUserProfie(userId);
      const result = { message: "Lấy user thành công!!", user:userResponseDTO};
      res.status(200).json(result);
    }
    catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode }) // tat ca cac loi quang ra day tra ve
    }
  }
};

module.exports = userController;
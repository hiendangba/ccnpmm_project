const userService = require("../services/user.service");
const UserResponse = require("../dto/response/user.response.dto");
const UpdateUserRequest = require("../dto/request/user.request.dto");
const CloudinaryError = require("../errors/cloudinary.error");
const cloudinary = require("../config/cloudinary");
const AppError = require("../errors/AppError");
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
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const {users, total} = await userService.getAllUsers(page, limit);

      const listUserResponse = users.map(user => new UserResponse(user));
      res.status(200).json({users: listUserResponse, total});

    }catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    };
  }
};

module.exports = userController;
const postService = require("../services/post.service");
const { PostResponse } = require("../dto/response/post.response.dto");
const { LikePostRequest, CommentPostRequest, SharePostRequest } = require("../dto/request/user.request.dto");
const { getIO } = require("../config/socket");

const postController = {
    getAllPost: async (req, res) => {
        try {
            const { page, limit, userId } = req.pagination;
            const userRequest = req.user.id;
            const { listResult, total } = await postService.getAllPost(page, limit, userId);
            const listPostResult = listResult.map(item => new PostResponse(item, userRequest));
            res.status(200).json({ message: "Lấy danh sách bài viết thành công.", listResult: listPostResult, total: total });
        } catch (err) {
            res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },
    likePost: async (req, res) => {
        try {
            const likePostRequest = new LikePostRequest(req.body);
            const likeResponseDTO = await postService.likePost(likePostRequest);
            // Tạo sự kiện socket USER_LIKE 
            const io = getIO();
            io.emit("USER_LIKE", likeResponseDTO);

            res.status(200).json({ message: "Xử lý like bài thành công.", likeResponseDTO });
        }
        catch (err) {
            res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }

    },
    commentPost: async (req, res) => {
        try {
            const commentPostRequest = new CommentPostRequest(req.body);
            const commentResponseDTO = await postService.commentPost(commentPostRequest);
            // socket o day
            const io = getIO();
            io.emit("USER_COMMENT", commentResponseDTO);

            res.status(200).json({ message: "Xử lý bình luận bài thành công.", commentResponseDTO });
        }
        catch (err) {
            res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },
    sharePost: async (req, res) => {
        try {
            const sharePostRequest = new SharePostRequest(req.body);
            const savedPost = await postService.sharePost(sharePostRequest);
            const sharePostResponseDTO = new PostResponse(savedPost, req.user.id);
            // socket o day
            res.status(200).json({ message: "Xử lý share bài thành công.", sharePostResponseDTO });
        }
        catch (err) {
            res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },
    deleteComment : async (req, res) => {
        try{
            // lấy ra id của user và id của post    
            const userId = req.user.id;
            const commentId = req.params.id;

            const responseDTO = await postService.deleteComment(userId, commentId);
            // socket để truyền đi ở đây
            const io = getIO();
            io.emit("USER_DELETE_COMMENT", responseDTO);
            res.status(200).json({ message: "Xóa bình luận thành công", responseDTO: responseDTO});

        }
        catch (err){
            res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    }
}
module.exports = postController;
const postService = require("../services/post.service");
const { PostResponse } = require("../dto/response/post.response.dto");
const { LikePostRequest, CommentPostRequest } = require("../dto/request/user.request.dto");
const { getIO } = require("../config/socket");

const postController = {
    getAllPost : async (req, res) => {
        try {
            const {page, limit, userId} = req.pagination;
            const userRequest = req.user.id;
            const { listResult, total } = await postService.getAllPost(page, limit, userId);
            const listPostResult = listResult.map(item => new PostResponse(item, userRequest));
            res.status(200).json({message: "Lấy danh sách bài viết thành công.", listResult: listPostResult, total: total});
        }catch (err){
            res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },
    likePost : async (req, res) => {
        try {
            const likePostRequest = new LikePostRequest (req.body);
            const likeResponseDTO  = await postService.likePost (likePostRequest);
            // Tạo sự kiện socket USER_LIKE 
            const io = getIO ();
            io.emit("USER_LIKE", likeResponseDTO);

            res.status(200).json({message: "Xử lý like bài thành công.", likeResponseDTO});
        }
        catch (err) {
            res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
        
    },
    commentPost : async (req, res) => {
        try {
            const commentPostRequest = new CommentPostRequest(req.body);
            const commentResponseDTO = await postService.commentPost (commentPostRequest);
            // socket o day
            const io = getIO ();
            io.emit("USER_COMMENT", commentResponseDTO);

            res.status(200).json({message: "Xử lý bình luận bài thành công.", commentResponseDTO});
        }
        catch (err) {
            res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    }
}
module.exports = postController;
const postService = require("../services/post.service");
const { PostResponse } = require("../dto/response/post.response.dto");

const postController = {
    getAllPost : async (req, res) => {
        try {
            const {page, limit, userId} = req.pagination;
            const { listResult, total } = await postService.getAllPost(page, limit, userId);
            const listPostResult = listResult.map(item => new PostResponse(item));
            res.status(200).json({message: "Lấy danh sách bài viết thành công.", listResult: listPostResult, total: total});
        }catch (err){
            res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    }
}
module.exports = postController;
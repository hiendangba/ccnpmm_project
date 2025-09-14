const Post = require("../models/post.model");
const AppError = require("../errors/AppError");

const postService = {
    getAllPost : async (page, limit, userid) =>{

        try {
            const skip = (page - 1) * limit;

            let query = {};
            if (userid) {
                query.userId = userid;
            }

            const total = await Post.countDocuments(query);
            const listResult= await Post.find(query).skip(skip).limit(limit).sort({ createdAt: -1});

            return { listResult, total };
        }
        catch (err){
            console.error("ERROR:", err);
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    }
}

module.exports = postService
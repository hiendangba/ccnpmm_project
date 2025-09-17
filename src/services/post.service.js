const Post = require("../models/post.model");
const AppError = require("../errors/AppError");
const {
    LikePostResponse
} = require("../dto/response/post.response.dto");
const Like = require("../models/like.model");
const mongoose = require("mongoose");

const postService = {
    getAllPost: async (page, limit, userid) => {

        try {
            const skip = (page - 1) * limit;

            let query = {
                deleted: false
            };
            if (userid) {
                query.userId = new mongoose.Types.ObjectId(userid);
            }

            const total = await Post.countDocuments(query);
            // const listResult= await Post.find(query).skip(skip).limit(limit).sort({ createdAt: -1});

            const listResult = await Post.aggregate([{
                    $match: query
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },

                // lookup like 
                {
                    $lookup: {
                        from: "likes",
                        let: {
                            postId: "$_id"
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [{
                                                $eq: ["$postId", "$$postId"]
                                            },
                                            {
                                                $eq: ["$deleted", false]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    userId: 1,
                                    createdAt: 1
                                }
                            }
                        ],
                        as: "likes"
                    }
                },

                // count likes 
                {
                    $addFields: {
                        likeCount: {
                            $size: "$likes"
                        }
                    }
                },

                // get user 
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },

                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },

                // lay likeUsers
                {
                    $lookup: {
                        from: "users",
                        localField: "likes.userId",
                        foreignField: "_id",
                        as: "likeUsers"
                    }
                },

                {
                    $project: {
                        content: 1,
                        images: 1,
                        createdAt: 1,
                        "user._id": 1,
                        "user.name": 1,
                        likeCount: 1,
                        "likeUsers._id": 1,
                        "likeUsers.name": 1
                    }
                }
            ]);

            return {
                listResult,
                total
            };
        } catch (err) {
            console.error("ERROR:", err);
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    likePost: async (likePostRequest) => {
        try {
            const {
                userId,
                postId
            } = likePostRequest;
            // tìm trong DB cái đối tượng có userid và likeId 
            let like = await Like.findOne({
                userId: userId,
                postId: postId
            }).populate("userId", "name");

            if (like) {
                like.deleted = !like.deleted;
                like.deletedAt = like.deleted ? new Date() : null;
                await like.save();
            } else {
                like = new Like({
                    userId: userId,
                    postId: postId,
                    deleted: false,
                    deletedAt: null,
                });
                await like.save();
                like = await like.populate("userId", "name");
            }
            return new LikePostResponse(like);
        } catch (err) {
            console.log("ERROR:", err);
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    }
}

module.exports = postService
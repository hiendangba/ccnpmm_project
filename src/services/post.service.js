const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const AppError = require("../errors/AppError");
const {
    LikePostResponse,
    CommentPostResponse,
    PostResponse
} = require("../dto/response/post.response.dto");
const Like = require("../models/like.model");
const mongoose = require("mongoose");

// Hàm build tree từ mảng comment phẳng
const buildCommentTree = (comments) => {
    const map = {};
    const roots = [];

    for (let c of comments) {
        c.childs = [];
        const parentId = c.parentCommentId ? String(c.parentCommentId) : null;
        if (!map[parentId]) map[parentId] = [];
        map[parentId].push(c);
    }

    for (let c of comments) {
        const id = String(c._id);
        if (map[id]) {
            c.childs = map[id];
        }
        if (!c.parentCommentId) {
            roots.push(c);
        }
    }

    return roots;
};

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
                    {
                        $project: {
                            id: "$_id",
                            "user._id": 1,
                            "user.name": 1,
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


            // lookup comment
            {
                $lookup: {
                    from: "comments",
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
                    {
                        $project: {
                            id: "$_id",
                            content: 1,
                            images: 1,
                            parentCommentId: 1,
                            postId: 1,
                            "user._id": 1,
                            "user.name": 1,
                            createdAt: 1,
                        }
                    }
                    ],
                    as: "commentUsers"
                }
            },

            // count likes 
            {
                $addFields: {
                    commentCount: {
                        $size: "$commentUsers"
                    }
                }
            },

            //lookup rootPost
            {
                $lookup: {
                    from: "posts",
                    let: {
                        rootPostId: "$rootPostId" // rootPostId của bài hiện tại
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $eq: ["$_id", "$$rootPostId"]
                                }]
                            }
                        }
                    },
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
                    {
                        $project: {
                            id: "$_id",
                            content: 1,
                            images: 1,
                            createdAt: 1,
                            "user._id": 1,
                            "user.name": 1,
                        }
                    }
                    ],
                    as: "rootPost"
                }
            },
            // biến rootPost từ mảng thành object
            {
                $unwind: {
                    path: "$rootPost",
                    preserveNullAndEmptyArrays: true
                }
            },
            // lấy thêm số người chia sẻ
            {
                $lookup: {
                    from: "posts",
                    let: {
                        postId: "$_id",
                        rootPostId: "$rootPostId"
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $cond: [{
                                    $eq: ["$$rootPostId", null]
                                }, // dk
                                {
                                    $eq: ["$rootPostId", "$$postId"]
                                }, // neu ma khong co root
                                {
                                    $eq: ["$originalPostId", "$$postId"]
                                } // neu ma co root thi no la cap 2 thooi
                                ]
                            }
                        }
                    },
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
                    {
                        $project: {
                            id: "$_id",
                            "user._id": 1,
                            "user.name": 1,
                            createdAt: 1
                        }
                    }
                    ],
                    as: "shareUsers"

                }
            },
            // lấy số lượng share
            {
                $addFields: {
                    shareCount: { $size: "$shareUsers" }
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

            {
                $project: {
                    id: "$_id",
                    content: 1,
                    images: 1,
                    createdAt: 1,
                    "user._id": 1,
                    "user.name": 1,
                    likeCount: 1,
                    likes: 1,
                    commentCount: 1,
                    commentUsers: 1,
                    shareUsers: 1,
                    shareCount: 1,
                    rootPost: 1,
                    originalPostId: 1,
                    rootPostId: 1
                }
            }
            ]);

            // xử lý comment thành cây trước khi return
            const resultWithTree = listResult.map((post) => {
                const commentTree = buildCommentTree(post.commentUsers || []);
                return {
                    ...post,
                    commentUsers: commentTree,
                };
            });

            return {
                listResult: resultWithTree,
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
    },
    commentPost: async (commentPostRequest) => {
        try {
            const newComment = new Comment({
                userId: commentPostRequest.userId,
                postId: commentPostRequest.postId,
                content: commentPostRequest.content,
                images: commentPostRequest.images,
                parentCommentId: commentPostRequest.parentCommentId
            });


            let savedComment = await newComment.save();
            savedComment = await savedComment.populate("userId", "name");
            return new CommentPostResponse(savedComment);

        } catch (err) {
            console.log("ERROR: ", err);
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },
    sharePost: async (sharePostRequest) => {
        const newPost = new Post({
            userId: sharePostRequest.userId,
            content: sharePostRequest.content || "",
            originalPostId: sharePostRequest.originalPostId || null,
            rootPostId: sharePostRequest.rootPostId || null
        });

        let savedPost = await newPost.save();
        savedPost = await savedPost.populate("userId", "name");
        savedPost = savedPost.toObject();
        savedPost.id = savedPost._id;
        savedPost.user = {
            _id: savedPost.userId._id,
            name: savedPost.userId.name
        };

        return savedPost;
    }
}

module.exports = postService
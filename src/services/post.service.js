const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const AppError = require("../errors/AppError");
const {
    LikePostResponse,
    CommentPostResponse,
    DeleteCommentResonse
} = require("../dto/response/post.response.dto");
const Like = require("../models/like.model");
const mongoose = require("mongoose");
const PostError = require("../errors/post.error.enum");

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


const deleteCommentAndChildren = async (commentId) => {
    const comment = await Comment.findById(commentId);
    if (!comment) return 0;

    // Tìm các comment con
    const children = await Comment.find({ parentCommentId: comment._id });

    let deletedCount = 0;

    for (const child of children) {
        deletedCount += await deleteCommentAndChildren(child._id); // gọi đệ quy để xóa sâu
    }

    // Đánh dấu xóa chính comment này
    if (!comment.deleted) {
        comment.deleted = true;
        comment.deletedAt = new Date();
        await comment.save();
        deletedCount += 1; // tính luôn comment hiện tại
    }

    return deletedCount;
}

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
                                    "user.avatar": 1,
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
                                    "user.avatar": 1,
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
                                    "user.avatar": 1,
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
                                    "user.avatar": 1,
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
                        "user.avatar": 1,
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
            }).populate("userId", "name avatar");

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
                like = await like.populate("userId", "name avatar");
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
            savedComment = await savedComment.populate("userId", "name avatar");
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
        savedPost = await savedPost.populate("userId", "name avatar");
        savedPost = savedPost.toObject();
        savedPost.id = savedPost._id;
        savedPost.user = {
            _id: savedPost.userId._id,
            name: savedPost.userId.name
        };

        return savedPost;
    },
    deleteComment : async (userId, commentId) => {
        try{
            if (!commentId){
                throw new AppError(PostError.COMMENT_NOT_FOUND);
            }
            // lấy thông tin comment lên
            let comment = await Comment.findById(commentId).populate("postId", "userId");
            if (!comment){
                throw new AppError(PostError.COMMENT_NOT_FOUND);
            }
            const isOwner = comment.userId.toString() === userId.toString();
            const isPostOwner  = comment.postId.userId.toString() === userId.toString();

            if (!isOwner && !isPostOwner){
                throw new AppError(PostError.CANNOT_DELETE_COMMENT);
            }

            if (comment.deleted){
                throw new AppError(PostError.COMMENT_ALREADY_DELETED);
            }
            // Gọi hàm xóa đệ quy
            const deletedCount = await deleteCommentAndChildren(comment._id);

            // Trả về DTO để frontend cập nhật lại giao diện
            return new DeleteCommentResonse(userId, comment.postId._id, comment._id, deletedCount); // user id này là coi người bình luận là ai 
        }
        catch(err){
            console.log("ERROR: ", err);
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    }
}

module.exports = postService
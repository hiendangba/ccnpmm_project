const User = require("../models/user.model");
const Post = require("../models/post.model");
const redisClient = require("../utils/redisClient");
const { nanoid } = require('nanoid');
const AppError = require("../errors/AppError");
const UserError = require("../errors/user.error.enum");
const {updateValidation} = require("../validations/auth.validation");
const elasticsearchService = require('./elasticsearch.service');
const UserResponse = require("../dto/response/user.response.dto");

const userServices = {
    getProfile: async (user) => {
        try{
            const foundUser = await User.findById(user.id).select("-password");
            if (!foundUser) {
                throw new AppError(UserError.NOT_FOUND);
            }
            return foundUser;
        }catch (err){
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    updateProfile: async (updateRequest, avatarUrl, id) => {
        try{
            const user = await User.findById(id);
            if (!user) {
                throw new AppError(UserError.NOT_FOUND);
            }
            updateValidation(updateRequest); 
            user.name = updateRequest.name ?? user.name;
            user.email = updateRequest.email ?? user.email;
            user.dateOfBirth = updateRequest.dateOfBirth 
            ? new Date(updateRequest.dateOfBirth) 
            : user.dateOfBirth;            
            user.bio = updateRequest.bio ?? user.bio;
            user.address = updateRequest.address ?? user.address;
            user.gender = updateRequest.gender ?? user.gender;
            if (avatarUrl) {
                user.avatar = avatarUrl;
            }
            const updatedUser = await user.save();
            
            // Đồng bộ với Elasticsearch
            await elasticsearchService.indexDocument('users', updatedUser._id.toString(), {
                name: updatedUser.name,
                email: updatedUser.email,
                mssv: updatedUser.mssv,
                bio: updatedUser.bio,
                address: updatedUser.address,
                gender: updatedUser.gender,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            });
            
            return updatedUser;
        }catch (err){
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    getAllUsers: async (page, limit, search, senderId) => {
        try {
            const skip = (page - 1) * limit;
            let users = [];
            let total = 0;
            console.log("search",search);
            if (search) {
                // 1️⃣ Search trong OpenSearch
                const esResult = await elasticsearchService.search('users', {
                    query: {
                        multi_match: {
                            query: search,
                            fields: ['name^3', 'mssv^2', 'email'],
                            fuzziness: 'AUTO'
                        }
                    },
                    from: skip,
                    size: limit
                });

                // OpenSearch client trả về result.body
                const hits = esResult.hits.hits;
                total = esResult.hits.total.value;
                console.log("hits",hits);
                const userIds = hits.map(hit => hit._id).filter(id => id !== senderId);
                if (userIds.length === 0) return { users: [], total };

                // 2️⃣ Lấy full document từ MongoDB
                const dbUsers = await User.find({ _id: { $in: userIds } });

                // 3️⃣ Sắp xếp theo thứ tự ES
                const userMap = dbUsers.reduce((acc, u) => {
                    acc[u._id.toString()] = u;
                    return acc;
                }, {});
                
                users = userIds.map(id => userMap[id]);

            } else {
                // Không search → lấy toàn bộ MongoDB (phân trang) loại trừ senderId
                total = await User.countDocuments({ _id: { $ne: senderId } });
                users = await User.find({ _id: { $ne: senderId } })
                                .skip(skip)
                                .limit(limit);
            }

            if (!users || users.length === 0) {
                throw new AppError(UserError.NOT_FOUND);
            }

            return { users, total };

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },


    postNew: async ( postNewRequest ) => {
        try {

            // Nếu như là avatar thì cập nhật trước 
            if (postNewRequest.isAvatar){
                let user = await User.findById(postNewRequest.userId);
                if (!user) {
                    throw new AppError(UserError.NOT_FOUND);
                }
                const avatar = postNewRequest.images?.[0];
                if (avatar){
                    user.avatar = avatar;
                    await user.save();
                }
            }

            const newPost = new Post({
                userId: postNewRequest.userId,
                content: postNewRequest.content || "",
                images: postNewRequest.images || [],
                originalPostId: postNewRequest.originalPostId || null,
                rootPostId: postNewRequest.rootPostId || null
            });

           let savedPost = await newPost.save();
           savedPost = await savedPost.populate("userId", "name avatar");
           savedPost = savedPost.toObject();
           savedPost.id = savedPost._id;
           savedPost.user = { _id: savedPost.userId._id, name: savedPost.userId.name, avatar: savedPost.userId.avatar };

           return savedPost;

        }
        catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    searchUser: async (senderId, search) => {
        try {
            console.log(search)
            const esResult = await elasticsearchService.search('users', {
                query: {
                    multi_match: {
                        query: search,
                        fields: ['name'],
                        fuzziness: 'AUTO'
                    }
                }
            });
            
            const userIds = esResult.hits.hits.map(hit => hit._id).filter(id => id !== senderId);
            const users = await User.find({ _id: { $in: userIds } });
            return users;
        }
        catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    getUserProfie: async (userId) => {
        try{
            // Thực hiện logic và quăng lỗi
            // checkID mốt check sau
            const user = await User.findById(userId).select("-password");
            if (!user) {
                throw new AppError (UserError.NOT_FOUND);
            }
            return new UserResponse(user);
            
        }
        catch (err) {
            // bắt lỗi, điều chỉnh và ném ra cho controller
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    } 

};
module.exports = userServices;

const User = require("../models/user.model");
const Post = require("../models/post.model");
const redisClient = require("../utils/redisClient");
const { nanoid } = require('nanoid');
const AppError = require("../errors/AppError");
const UserError = require("../errors/user.error.enum");
const {updateValidation} = require("../validations/auth.validation");
const elasticClient = require('../config/elastic.client');



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
            console.log(user)
            console.log(updateRequest)
            updateValidation(updateRequest); 
            console.log(updateRequest.dateOfBirth) 
            user.name = updateRequest.name ?? user.name;
            user.email = updateRequest.email ?? user.email;
            user.dateOfBirth = updateRequest.dateOfBirth 
            ? new Date(updateRequest.dateOfBirth) 
            : user.dateOfBirth;            
            console.log(user.dateOfBirth)
            user.bio = updateRequest.bio ?? user.bio;
            user.address = updateRequest.address ?? user.address;
            user.gender = updateRequest.gender ?? user.gender;
            if (avatarUrl) {
                user.avatar = avatarUrl;
            }
            const updatedUser = await user.save();
            return updatedUser;
        }catch (err){
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    getAllUsers: async (page, limit, search) => {
    try {
        const skip = (page - 1) * limit;
        let users = [];
        let total = 0;

        if (search) {
        // 1️⃣ Search trong Elasticsearch
        const esResult = await elasticClient.search({
            index: 'users',
            body: {
            query: {
                multi_match: {
                query: search,
                fields: ['name^3', 'mssv^2', 'email'],
                fuzziness: 'AUTO'
                }
            },
            from: skip,
            size: limit
            }
        });

        total = esResult.hits.total.value;
        const userIds = esResult.hits.hits.map(hit => hit._id);

        if (userIds.length === 0) {
            return { users: [], total };
        }

        // 2️⃣ Lấy full document từ MongoDB
        const dbUsers = await User.find({ _id: { $in: userIds } });

        // 3️⃣ Sắp xếp theo thứ tự ES
        const userMap = dbUsers.reduce((acc, u) => {
            acc[u._id.toString()] = u;
            return acc;
        }, {});
        
        users = userIds.map(id => userMap[id]);

        } else {
        // Nếu không search, lấy toàn bộ MongoDB (phân trang)
        total = await User.countDocuments();
        users = await User.find()
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
            const newPost = new Post({
                userId: postNewRequest.userId,
                content: postNewRequest.content || "",
                images: postNewRequest.images || [],
                originalPostId: postNewRequest.originalPostId || null,
                rootPostId: postNewRequest.rootPostId || null
            });

           await newPost.save();

        }
        catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

};
module.exports = userServices;
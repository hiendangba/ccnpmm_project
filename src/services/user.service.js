const User = require("../models/user.model");
const redisClient = require("../utils/redisClient");
const { nanoid } = require('nanoid');
const AppError = require("../errors/AppError");
const UserError = require("../errors/user.error.enum");
const {updateValidation} = require("../validations/auth.validation");



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

    getAllUsers: async(page, limit) =>{
        try{
            const skip = (page - 1) * limit;
            const users = await User.find()
                                .skip(skip)
                                .limit(limit);
            const total = await User.countDocuments();

            if(!users){
                throw new AppError(UserError.NOT_FOUND);
            }
            return {
                users,
                total
                };
        }catch (err){
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    }

};
module.exports = userServices;
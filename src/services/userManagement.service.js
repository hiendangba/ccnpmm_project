const User = require('../models/user.model');
const Post = require('../models/post.model');
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const Friendship = require('../models/friendship.model');
const AppError = require('../errors/AppError');

const userManagementServices = {
    // Lấy danh sách tất cả users với phân trang và tìm kiếm (cho admin)
    getAllUsersForAdmin: async (page = 1, limit = 10, search = '', role = '') => {
        try {
            const skip = (page - 1) * limit;
            let query = {};
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { mssv: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            if (role) {
                query.role = role;
            }

            const users = await User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await User.countDocuments(query);

            return {
                users,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            };
        } catch (error) {
            throw new AppError('Failed to get users', 500);
        }
    },

    // Lấy thông tin chi tiết user (cho admin)
    getUserByIdForAdmin: async (userId) => {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new AppError('User not found', 404);
            }
            return user;
        } catch (error) {
            throw error instanceof AppError ? error : new AppError('Failed to get user', 500);
        }
    },

    // Cập nhật role của user
    updateUserRole: async (userId, newRole) => {
        try {
            if (!['user', 'admin'].includes(newRole)) {
                throw new AppError('Invalid role. Must be user or admin', 400);
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { role: newRole },
                { new: true }
            ).select('-password');

            if (!user) {
                throw new AppError('User not found', 404);
            }

            return user;
        } catch (error) {
            throw error instanceof AppError ? error : new AppError('Failed to update user role', 500);
        }
    },

    // Xóa user (soft delete)
    deleteUser: async (userId) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Soft delete user
            await User.findByIdAndUpdate(userId, { 
                deleted: true,
                deletedAt: new Date()
            });

            // Xóa posts của user
            await Post.updateMany(
                { userId },
                { 
                    deleted: true,
                    deletedAt: new Date()
                }
            );

            // Xóa conversations của user
            await Conversation.deleteMany({
                $or: [
                    { participants: userId },
                    { createdBy: userId }
                ]
            });

            // Xóa friendships của user
            await Friendship.deleteMany({
                $or: [
                    { user1: userId },
                    { user2: userId }
                ]
            });

            return { message: 'User deleted successfully' };
        } catch (error) {
            throw error instanceof AppError ? error : new AppError('Failed to delete user', 500);
        }
    },

    // Khôi phục user đã bị xóa
    restoreUser: async (userId) => {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { 
                    deleted: false,
                    deletedAt: null
                },
                { new: true }
            ).select('-password');

            if (!user) {
                throw new AppError('User not found', 404);
            }

            return user;
        } catch (error) {
            throw error instanceof AppError ? error : new AppError('Failed to restore user', 500);
        }
    },

    // Lấy thống kê users theo role
    getUserStatsByRole: async () => {
        try {
            const stats = await User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const result = {};
            stats.forEach(stat => {
                result[stat._id] = stat.count;
            });

            return result;
        } catch (error) {
            throw new AppError('Failed to get user stats', 500);
        }
    },

    // Lấy thống kê tổng quan
    getDashboardStats: async () => {
        try {
            const totalUsers = await User.countDocuments({ deleted: { $ne: true } });
            const totalPosts = await Post.countDocuments({ deleted: { $ne: true } });
            const totalMessages = await Message.countDocuments();
            const totalConversations = await Conversation.countDocuments();
            const totalFriendships = await Friendship.countDocuments();

            // Thống kê theo thời gian (30 ngày gần nhất)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const newUsersThisMonth = await User.countDocuments({
                createdAt: { $gte: thirtyDaysAgo },
                deleted: { $ne: true }
            });

            const newPostsThisMonth = await Post.countDocuments({
                createdAt: { $gte: thirtyDaysAgo },
                deleted: { $ne: true }
            });

            return {
                totalUsers,
                totalPosts,
                totalMessages,
                totalConversations,
                totalFriendships,
                newUsersThisMonth,
                newPostsThisMonth
            };
        } catch (error) {
            throw new AppError('Failed to get dashboard stats', 500);
        }
    }
};

module.exports = userManagementServices;

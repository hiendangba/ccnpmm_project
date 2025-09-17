const FriendRequest = require("../models/friendrequest.model");
const Friendship = require("../models/friendship.model");
const Conversation = require("../models/conversation.model");
const AppError = require("../errors/AppError");
const FriendError = require("../errors/friend.error");
const User = require("../models/user.model");
const { getIO } = require("../config/socket");


const friendServices = {
    sendRequest: async (senderId, sendFriendRequestDto) => {
        try {
            const { receiverId, message } = sendFriendRequestDto;
            
            if (senderId.toString() === receiverId.toString()) {
                throw new AppError(FriendError.CANNOT_ADD_SELF);
            }

            const receiver = await User.findById(receiverId);
            if (!receiver) {
                throw new AppError(FriendError.USER_NOT_FOUND);
            }

            const alreadyFriend = await Friendship.findOne({
                $or: [
                    { userA: senderId, userB: receiverId },
                    { userA: receiverId, userB: senderId },
                ],
            });
 
            if (alreadyFriend) {
                throw new AppError(FriendError.ALREADY_FRIENDS);
            }


            const existing = await FriendRequest.findOne({
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            });

            const io = getIO();

            if (existing) {
                switch (existing.status) {
                    case "pending":
                        // Nếu request cũ là do receiver gửi => coi như đồng ý
                        if (
                            existing.senderId.toString() === receiverId.toString() &&
                            existing.receiverId.toString() === senderId.toString()
                        ) {
                            existing.status = "accepted";
                            await existing.save();

                            const result = await Friendship.create({
                                userA: senderId,
                                userB: receiverId,
                            });
                            
                            const existingConversation = await Conversation.findOne({
                                isGroup: false,
                                members: { $all: [senderId, receiverId], $size: 2 }
                            });

                            if (!existingConversation) {
                                await Conversation.create({
                                    members: [senderId, receiverId],
                                    createdBy: senderId,
                                    isGroup: false
                                });
                            }

                            io.to(receiverId.toString()).emit("friendAccept", result);
                            return existing; // accepted
                        }
                        throw new AppError(FriendError.ALREADY_REQUESTED);

                    case "accepted":
                        throw new AppError(FriendError.ALREADY_FRIENDS);

                    case "rejected":
                        // Cho phép gửi lại: reset lại request
                        existing.status = "pending";
                        existing.senderId = senderId;
                        existing.receiverId = receiverId;
                        existing.message = message;
                        await existing.save();

                        io.to(receiverId.toString()).emit("friendRequest", existing);
                        
                        return existing;

                    default:
                        throw new AppError(FriendError.STATUS_ERROR);
                }
            }

            // 5. Tạo request mới
            const friendRequest = await FriendRequest.create({
                senderId,
                receiverId,
                message,
                status: "pending",
            });

            io.to(receiverId.toString()).emit("friendRequest", friendRequest);

            return friendRequest;

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    acceptRequest: async (senderId, friendActionDto) => {
        try {
            const { requestId } = friendActionDto;
            // 1. Lấy request
            const request = await FriendRequest.findOne({senderId: requestId, receiverId: senderId});
            if (!request) {
                throw new AppError(FriendError.REQUEST_NOT_FOUND);
            }
            // 2. Kiểm tra trạng thái
            switch (request.status) {
                case "pending":
                    request.status = "accepted";
                    await request.save();

                    // 3. Tạo Friendship
                    await Friendship.create({
                        userA: senderId,
                        userB: requestId,
                    });

                    const existingConversation = await Conversation.findOne({
                        isGroup: false,
                        members: { $all: [senderId, requestId], $size: 2 }
                    });

                    if (!existingConversation) {
                        await Conversation.create({
                            members: [senderId, requestId],
                            createdBy: senderId,
                            isGroup: false
                        });
                    }

                    return request;

                case "accepted":
                    throw new AppError(FriendError.ALREADY_FRIENDS);

                case "rejected":
                    throw new AppError(FriendError.REQUEST_REJECTED);

                default:
                    throw new AppError(FriendError.STATUS_ERROR);
            }            

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    rejectRequest: async(senderId, friendActionDto) => {
        try {
            const { requestId } = friendActionDto;
            // 1. Lấy request
            const request = await FriendRequest.findOne({senderId: requestId, receiverId: senderId});
            if (!request) {
                throw new AppError(FriendError.REQUEST_NOT_FOUND);
            }
            // 2. Kiểm tra trạng thái
            switch (request.status) {
                case "pending":
                    request.status = "rejected";
                    await request.save();
                    return request;

                case "accepted":
                    throw new AppError(FriendError.ALREADY_FRIENDS);

                case "rejected":
                    throw new AppError(FriendError.REQUEST_REJECTED);

                default:
                    throw new AppError(FriendError.STATUS_ERROR);
            }            

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },

    cancelRequest: async(senderId, friendActionDto) => {
        try {
            const { requestId } = friendActionDto;
            // 1. Lấy request
            const request = await FriendRequest.findOne({senderId: senderId, receiverId: requestId});
            if (!request) {
                throw new AppError(FriendError.REQUEST_NOT_FOUND);
            }

            const result = request;
            // 2. Kiểm tra trạng thái
            switch (request.status) {
                case "pending":
                    await request.deleteOne();
                    return result;

                case "accepted":
                    throw new AppError(FriendError.ALREADY_FRIENDS);

                case "rejected":
                    throw new AppError(FriendError.REQUEST_REJECTED);

                default:
                    throw new AppError(FriendError.STATUS_ERROR);
            }            

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },

    removeFriend: async(senderId, friendActionDto) => {
        try {
            const { requestId } = friendActionDto;
            const [a, b] = [senderId, requestId].sort();

            // 1. Lấy friendship
            const friendship = await Friendship.findOne({ userA: a, userB: b });
            if (!friendship) {
                throw new AppError(FriendError.ALREADY_NOT_FRIENDS);
            }

            await friendship.deleteOne();

            // 2. Xóa conversation 1-1 nếu có
            const conversation = await Conversation.findOne({
                isGroup: false,
                members: { $all: [senderId, requestId], $size: 2 }
            });
            if (conversation) {
                await conversation.deleteOne();
            }

            // 3. Xóa tất cả friend request liên quan
            await FriendRequest.deleteMany({
                $or: [
                    { senderId: senderId, receiverId: requestId },
                    { senderId: requestId, receiverId: senderId }
                ]
            });
            return friendship;

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },

    getRequest: async(senderId) => {
        try {
            const listFriendRequest = await FriendRequest.find({
                receiverId: senderId,
                status: "pending"
            }).sort({ createdAt: -1 });
            return listFriendRequest;

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },

    getListFriend: async(senderId) => {
        try {
            const friendships = await Friendship.find({
                $or: [
                    { userA: senderId },
                    { userB: senderId }
                ]
            }).sort({ createdAt: -1 });

            const friendIds = friendships.map(f => 
                f.userA.toString() === senderId.toString() ? f.userB : f.userA
            );

            return friendIds;

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },
};

module.exports = friendServices;

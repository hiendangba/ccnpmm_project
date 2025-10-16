const FriendRequest = require("../models/friendrequest.model");
const Friendship = require("../models/friendship.model");
const Conversation = require("../models/conversation.model");
const AppError = require("../errors/AppError");
const FriendError = require("../errors/friend.error");
const User = require("../models/user.model");


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
            })
            if (existing) {
                switch (existing.status) {
                    case "pending":
                        if (
                            existing.senderId.toString() === receiverId.toString() &&
                            existing.receiverId.toString() === senderId.toString()
                        ) {
                            
                            existing.status = "accepted";
                            await existing.save();

                            await Friendship.create({
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
                            await existing.populate("receiverId", "name avatar email")
                            await existing.populate("senderId", "name avatar email"); // accepted

                            return existing;
                        }
                        throw new AppError(FriendError.ALREADY_REQUESTED);

                    case "accepted":
                        throw new AppError(FriendError.ALREADY_FRIENDS);

                    case "rejected":
                        existing.status = "pending";
                        existing.senderId = senderId;
                        existing.receiverId = receiverId;
                        existing.message = message;
                        await existing.save();                        
                        await existing.populate("senderId", "name avatar email");
                        await existing.populate("receiverId", "name avatar email");;
                        return existing;
                    default:
                        throw new AppError(FriendError.STATUS_ERROR);
                }
            }

            // 5. Tạo request mới
            let friendRequest = await FriendRequest.create({
            senderId,
            receiverId,
            message,
            status: "pending",
            });
            
            await friendRequest.populate("senderId", "name avatar email")
            await friendRequest.populate("receiverId", "name avatar email")
            return friendRequest;

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    acceptRequest: async (senderId, friendActionDto) => {
        try {
            const { requestId } = friendActionDto;
            // 1. Lấy request
            const request = await FriendRequest.findOne({
                senderId: requestId,
                receiverId: senderId
            }).populate("receiverId", "name avatar");    

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
            const request = await FriendRequest.findOne({
                senderId: requestId,
                receiverId: senderId
            }).populate("receiverId", "name avatar"); 

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
            const request = await FriendRequest.findOne({senderId: senderId, receiverId: requestId}).populate("senderId", "name avatar");
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

            const friendRequest = await FriendRequest.findOne({
            $or: [
                { senderId: senderId, receiverId: requestId },
                { senderId: requestId, receiverId: senderId }
            ]
            }).populate("senderId", "name avatar").populate("receiverId", "name avatar");

            await friendRequest.deleteOne();

            return friendRequest;

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },

    getReceivedRequest: async(senderId) => {
        try {
            const listFriendRequestReceived = await FriendRequest.find({
                receiverId: senderId,
                status: "pending"
            }).sort({ createdAt: -1 }).populate("senderId", "name avatar"); 
            return listFriendRequestReceived

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },


    getSentRequest: async(senderId) => {
        try {
            const listFriendRequestSent = await FriendRequest.find({
                senderId: senderId,
                status: "pending"
            }).sort({ createdAt: -1 }).populate("receiverId", "name avatar"); 
            return listFriendRequestSent

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },

    getListFriend: async(senderId) => {
        try {
            const listFriend = await FriendRequest.find({
                $or: [
                    { senderId: senderId, status: "accepted" },
                    { receiverId: senderId, status: "accepted" }
                ]
            })
            .sort({ createdAt: -1 })
            .populate("senderId", "name avatar")
            .populate("receiverId", "name avatar");


            const friends = listFriend.map(fr => {
                const frObj = fr.toObject();
                // nếu mình là senderId thì gán lại senderId = receiverId
                if (fr.senderId._id.toString() === senderId.toString()) {
                    frObj.senderId = fr.receiverId;
                }
                return frObj;
            });

            return friends;

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },


    searchListFriend: async function(senderId, keyword) {
        try {
            const friends = await this.getListFriend(senderId);
            const lowerKeyword = keyword.toLowerCase();
            const filteredFriends = friends.filter(fr => 
                fr.senderId.name.toLowerCase().includes(lowerKeyword)
            );
            return filteredFriends;
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }      
    },
};

module.exports = friendServices;

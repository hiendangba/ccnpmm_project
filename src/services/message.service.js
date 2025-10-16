const mongoose = require("mongoose")
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const User = require("../models/user.model")
const AppError = require("../errors/AppError");
const MessageError = require("../errors/message.error");


const messageServices = {
    getMessageOneToOne: async (senderId, receiverId, page, limit) => {
        try {
            // 1. Tìm conversation 1-1
            let conversation = await Conversation.findOne({
                isGroup: false,
                members: { $all: [senderId, receiverId], $size: 2 }
            });

            // 2. Tính offset
            const skip = (page - 1) * limit;

            // 3. Lấy messages theo page
            const messages = await Message.find({ conversationId: conversation._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // 4. Đếm tổng số message
            const totalMessages = await Message.countDocuments({ conversationId: conversation._id });

            // 5. Trả về cùng lúc
            return { messages, totalMessages, conversationId: conversation._id };
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    getMessageGroup: async (conversationId, page, limit) => {
        try {

            // 1. Tính offset
            const skip = (page - 1) * limit;

            const messages = await Message.find({ conversationId: conversationId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // 2. Đếm tổng số message
            const totalMessages = await Message.countDocuments({ conversationId: conversationId });
            return { messages, totalMessages };

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    sendMessage: async (sendMessageRequest, senderId) => {
        try {
            const conversation = await Conversation.findById(sendMessageRequest.conversationId);
            if (!conversation.members.includes(senderId)) {
                throw new AppError(MessageError.USER_NOT_IN_CONVERSATION);
            }

            if (!sendMessageRequest.content && sendMessageRequest.type != "call" && (!sendMessageRequest.attachments || sendMessageRequest.attachments.length === 0)) {
                throw new AppError(MessageError.EMPTY_MESSAGE);
            }


            const message = new Message({
                conversationId: sendMessageRequest.conversationId,
                senderId: senderId,
                content: sendMessageRequest.content,
                readBy: [senderId], // người gửi auto đã đọc
                type: sendMessageRequest.type || "text",
                startedAt: sendMessageRequest.startedAt,
                callStatus: sendMessageRequest.callStatus,
                endedAt: sendMessageRequest.endedAt,
                duration: sendMessageRequest.duration,
                attachments: sendMessageRequest.attachments || [],
            });
            await message.save();
            return message;

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    updateCallStatus: async (updateCallRequest, senderId) => {
        try {
            const { conversationId, callStatus, endedAt } = updateCallRequest;

            const message = await Message.findOne({
                conversationId,
                type: "call",
                callStatus: { $in: ["ringing", "ongoing"] }
            }).sort({ createdAt: -1 });
            if (!message) throw new AppError(MessageError.CALL_NOT_FOUND);

            const conversation = await Conversation.findById(conversationId);
            const isGroup = conversation?.isGroup;

            if (isGroup) {
                if (!message.joinedUsers) message.joinedUsers = [];
                if (!message.rejectedUsers) message.rejectedUsers = [];
                console.log("callStatus:", callStatus);
                if (callStatus === "rejected") {
                    // Người này từ chối cuộc gọi nhóm
                    if (!message.rejectedUsers.includes(senderId)) {
                        message.rejectedUsers.push(senderId);
                        console.log("rejectedUsers:", message.rejectedUsers);
                    }
                }

                if (callStatus === "canceled") {
                    message.callStatus = "canceled";
                    message.endedAt = new Date();
                    message.duration = message.startedAt
                        ? Math.floor((message.endedAt - message.startedAt) / 1000)
                        : 0;
                }

                if (callStatus === "ongoing") {
                    if (!message.joinedUsers.includes(senderId)) {
                        message.joinedUsers.push(senderId);
                    }
                }

                if (callStatus === "ended") {
                    if (!message.endedUsers) message.endedUsers = [];
                    if (!message.endedUsers.includes(senderId)) {
                        message.endedUsers.push(senderId);
                    }
                }

                // 4️⃣ Kiểm tra nếu tất cả đã từ chối → callStatus = "rejected"
                const allRejected = conversation.members
                    .filter((u) => u.toString() !== message.senderId.toString()) // bỏ người gọi
                    .every((u) => message.rejectedUsers.includes(u.toString()));

                console.log("allRejected", allRejected);
                if (allRejected) {
                    message.callStatus = "rejected";
                    message.endedAt = new Date();
                    message.duration = 0;
                }

                if (callStatus === "ended" && endedAt) {
                    message.callStatus = "ended";
                    message.endedAt = endedAt;
                    message.duration = Math.floor(
                        (new Date(endedAt).getTime() - new Date(message.startedAt).getTime()) / 1000
                    );
                }
            } else {
                if (callStatus) message.callStatus = callStatus;

                if (endedAt) {
                    message.endedAt = endedAt;
                    message.duration = Math.floor(
                        (new Date(endedAt).getTime() - new Date(message.startedAt).getTime()) / 1000
                    );
                }
            }

            await message.save();
            return message;
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },


    createGroup: async (name, members, avatar, userId) => {
        try {
            if (!members || members.length < 2) {
                throw new AppError(MessageError.INVALID_MEMBERS);
            }

            if (!members.includes(userId)) {
                members.push(userId);
            }

            const group = new Conversation({
                name,
                members,
                avatar,
                createdBy: userId,
                isGroup: true
            });

            await group.save();

            return group;
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    markAsRead: async (messageId, userId) => {
        try {
            const message = await Message.findById(messageId);

            if (!message) {
                throw new AppError(MessageError.MESSAGE_NOT_FOUND);
            }

            const conversation = await Conversation.findById(message.conversationId);
            if (!conversation.members.includes(userId)) {
                throw new AppError(MessageError.USER_NOT_IN_CONVERSATION);
            }

            if (!message.readBy.includes(userId)) {
                message.readBy.push(userId);
                await message.save();
                return { updated: true, message };
            } else {
                return { updated: false };  // đã đọc rồi, không update nữa
            }

        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    conversation: async (userId) => {
        try {
            const conversations = await Conversation.find({ members: userId }).lean();
            const convsWithLastMsg = await Promise.all(
                conversations.map(async (conv) => {
                    const lastMessage = await Message.findOne({ conversationId: conv._id })
                        .sort({ createdAt: -1 })
                        .lean();

                    const memberIds = (Array.isArray(conv.members) ? conv.members : [])
                        .filter(id => typeof id === "string" && id.length === 24)
                        .map(id => new mongoose.Types.ObjectId(id));

                    const members = await User.find({ _id: { $in: memberIds } })
                        .select("_id name avatar")
                        .lean();

                    return {
                        ...conv,
                        lastMessage,
                        members
                    };
                })
            );

            // Sort conversation theo lastMessage.createdAt giảm dần
            convsWithLastMsg.sort((a, b) => {
                const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
                const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
                return timeB - timeA; // giảm dần: mới → cũ
            });

            return convsWithLastMsg;
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    }
}

module.exports = messageServices;

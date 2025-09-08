const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const AppError = require("../errors/AppError");
const MessageError = require("../errors/message.error");


const messageServices = {
    getMessageOneToOne: async (senderId, receiverId, page, limit) => {
        try{
            // 1. Tìm conversation 1-1
            let conversation = await Conversation.findOne({
            isGroup: false,
            members: { $all: [senderId, receiverId], $size: 2 }
            });

            // 2. Tính offset
            const skip = (page - 1) * limit;

            // 3. Lấy messages theo page
            const messages = await Message.find({ conversationId: conversation._id })
                                        .sort({ createdAt: 1 })
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

    sendMessage: async (sendMessageRequest, senderId) => {
        try{
            console.log(sendMessageRequest)
            console.log(senderId)
            console.log(sendMessageRequest.conversationId)
            
            const conversation = await Conversation.findById(sendMessageRequest.conversationId);
            if (!conversation.members.includes(senderId)) {
                throw new AppError(MessageError.USER_NOT_IN_CONVERSATION);
            }

            if (!sendMessageRequest.content && (!sendMessageRequest.attachments || sendMessageRequest.attachments.length === 0)) {
                throw new AppError(MessageError.EMPTY_MESSAGE);
            }

            const message = new Message({
                conversationId: sendMessageRequest.conversationId,
                senderId: senderId,
                content: sendMessageRequest.content,
                readBy: [senderId], // người gửi auto đã đọc
                type: sendMessageRequest.type || "text",
                attachments: sendMessageRequest.attachments || []
            });
            
            await message.save();
            return message;

        }catch (err){
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    getConversationIDs: async(userId) =>{
        try {
            const conversations = await Conversation.find(

                { members: userId },
                { _id: 1 }
            );
            return conversations.map(c => c._id);
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },

    createGroup: async (name, members, userId) =>{
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
                createdBy: userId,
                isGroup: true
            });

            await group.save();

            return group;
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }  
    },

    markAsRead: async (messageId, userId) =>{
        try {
            const message = await Message.findById(messageId);

            if (!message) {
                throw new AppError(MessageError.MESSAGE_NOT_FOUND);
            }

            const conversation = await Conversation.findById(message.conversationId);
            if (!conversation.members.includes(userId)) {
                throw new AppError(MessageError.USER_NOT_IN_CONVERSATION);
            }

            // Nếu user chưa có trong danh sách đã đọc thì mới thêm
            if (!message.readBy.includes(userId)) {
                message.readBy.push(userId);
                await message.save();
            }

            return message;
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }          
    }
}
module.exports = messageServices;

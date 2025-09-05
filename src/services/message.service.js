const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const AppError = require("../errors/AppError");

const messageServices = {
    getOrCreateOneToOne: async (senderId, receiverId, page, limit) => {
        try{
            // 1. Tìm conversation 1-1
            let conversation = await Conversation.findOne({
            isGroup: false,
            members: { $all: [senderId, receiverId], $size: 2 }
            });

            if (!conversation) {
            // Nếu chưa có conversation, tạo mới
            conversation = new Conversation({
                isGroup: false,
                members: [senderId, receiverId],
                createdBy: senderId
            });
            await conversation.save();

            // Chưa có tin nhắn nào
            return { messages: [], totalMessages: 0 };
            }

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
            return { messages, totalMessages };
        } catch (err) {
            throw err instanceof AppError ? err : AppError.fromError(err);
        }
    },
}
module.exports = messageServices;

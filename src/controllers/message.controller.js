const messageServices = require("../services/message.service");
const MessageResponse = require("../dto/response/message.response.dto")
const ApiResponse = require("../dto/response/api.response.dto")
const ConversationDTO = require("../dto/response/conversation.response.dto")
const { getIO } = require("../config/socket"); // file socket của bạn
const {SendMessageRequest} = require("../dto/request/message.request.dto")
const AppError = require("../errors/AppError");
const CloudinaryError = require("../errors/cloudinary.error");
const cloudinary = require("../config/cloudinary");

const messageController = {
  getMessageOneToOne: async (req, res) => {
      try {

        const senderId = req.user.id;
        const {receiverId } = req.query;
        let { page, limit } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 99999;  
        const {messages, totalMessages, conversationId} = await messageServices.getMessageOneToOne(senderId, receiverId, page, limit);        
        return  res.status(200).json(
                    new ApiResponse({ conversationId: conversationId, 
                                      messages: messages.map(m => new MessageResponse(m))}, 
                                      {
                                        page,
                                        limit,
                                        totalItems: totalMessages,
                                        }))   

      } catch (err) {
          return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
      }
  },

  getMessageGroup: async(req, res)=>{
    try{
      const {conversationId } = req.query;
      let { page, limit } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 20;  
      const {messages, totalMessages} = await messageServices.getMessageGroup(conversationId, page, limit);        
      return  res.status(200).json(
                    new ApiResponse({ conversationId: conversationId, 
                                      messages: messages.map(m => new MessageResponse(m))}, 
                                      {
                                        page,
                                        limit,
                                        totalItems: totalMessages,
                                        }))   

    } catch (err) {
      return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }
  },

  sendMessage: async (req, res)=>{
    try {
          const senderId = req.user.id;

          // Lấy text + file
          const { conversationId, content } = req.body;
          let attachment = null;
          if (req.file) {
            attachment = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                  (error, result) => {
                    if (error) return reject(new AppError(CloudinaryError.CLOUD_UPLOAD_ERROR));
                    resolve({ url: result.secure_url, name: result.original_filename });
                    }
                  ).end(req.file.buffer); // dùng buffer của multer
              });
          }

          const sendMessageRequest = new SendMessageRequest({
            conversationId,
            content,
            attachments: [attachment] || undefined
          });
          const newMessage = await messageServices.sendMessage(sendMessageRequest, senderId);
          const message = new MessageResponse(newMessage);
          console.log(message);
          const io = getIO();
          io.to(conversationId.toString()).emit("receiveMessageChatPage", message);
          io.to(conversationId.toString()).emit("receiveMessage", message);

          return res.status(200).json(
            new ApiResponse({
              conversationId: conversationId,
              message: message,
            }));
    } catch (err) {
        console.error(err); // log lỗi chi tiết
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
            status: err.statusCode || 500,
            errorCode: err.errorCode || "INTERNAL_ERROR"
        });
    }    
  },


  createGroup: async(req, res) =>{
    try {
      const userId = req.user.id;
      const { name, members } = req.body;

      const group = await messageServices.createGroup(name, members, userId);

      const result = new ConversationDTO(group);
      return res.status(201).json(new ApiResponse(result));

    } catch (err) {
      res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }    
  },

  markAsRead: async(req, res) =>{
      try {
          const messageId = req.params.id;
          const userId = req.user.id;
          const result = await messageServices.markAsRead(messageId, userId);

          if (result.updated) {
            const message = new MessageResponse(result.message)

            const io = getIO();
            io.to(result.message.conversationId.toString()).emit("messageReadChatPage", message);

            io.to(result.message.conversationId.toString()).emit("messageRead", message);
            return res.status(201).json(new ApiResponse(message));
          } else {
              return res.status(200).json({ success: false });
          }
      } catch (err) {
          res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });  
      }      
    },    

  // hàm trả về tất cả cuộc trò chuyện và tất cả user có tham gia và trả tin nhắn mới nhất của cuộc trò chuyện
  conversation: async(req, res) =>{
    try {
      const userId = req.user.id;
      const conversations = await messageServices.conversation(userId);
      const results = conversations.map(conv => new ConversationDTO(conv));
      return res.status(201).json(new ApiResponse(results));
    }
    catch (err) {
      // res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
            status: err.statusCode || 500,
            errorCode: err.errorCode || "INTERNAL_ERROR"
        });
    }   
  }
}

module.exports = messageController;
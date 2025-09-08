const messageServices = require("../services/message.service");
const MessageResponse = require("../dto/response/message.response.dto")
const ApiResponse = require("../dto/response/api.response.dto")
const ConversationDTO = require("../dto/response/conversation.response.dto")
const { getIO } = require("../config/socket"); // file socket của bạn
const {SendMessageRequest} = require("../dto/request/message.request.dto")
const messageController = {
  getMessageOneToOne: async (req, res) => {
      try {

        const senderId = req.user.id;
        const {receiverId } = req.query;
        let { page, limit } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;  
        const {messages, totalMessages, conversationId} = await messageServices.getMessageOneToOne(senderId, receiverId, page, limit);        
        return  res.status(200).json(
                    new ApiResponse({ conversationId: conversationId, 
                                      messages: messages}, 
                                      {
                                        page,
                                        limit,
                                        totalItems: totalMessages,
                                        DTOClass: MessageResponse}))   

      } catch (err) {
          return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
      }
  },

  sendMessage: async (req, res)=>{
    try {

        const senderId = req.user.id;
        sendMessageRequest = new SendMessageRequest(req.body);
        const newMessage = await messageServices.sendMessage(sendMessageRequest, senderId);
        
        const message = new MessageResponse(newMessage)
       
        const io = getIO();
        io.to(sendMessageRequest.conversationId).emit("receiveMessage", message);
        
        return  res.status(200).json(
                    new ApiResponse({ conversationId: sendMessageRequest.conversationId, 
                                      message: message}))  
    } catch (err) {
        //res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
            status: err.statusCode || 500,
            errorCode: err.errorCode || "INTERNAL_ERROR"
        });
      }    
  },

  getConversationID: async(req, res) =>{
    try {

        const userId = req.user.id;

        const conversationIds = await messageServices.getConversationIDs(userId);

        return res.status(200).json(
            new ApiResponse({
                conversationIds
            })
        );
    } catch (err) {
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
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
        const message = await messageServices.markAsRead(messageId, userId)

        const io = getIO();
        io.to(message.conversationId.toString()).emit("messageRead", {
            messageId: message._id,
            userId,
            conversationId: message.conversationId
        });

        const result = new MessageResponse(message);
        return res.status(201).json(new ApiResponse(result));
    } catch (err) {
        res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
    }      
  }
}

module.exports = messageController;
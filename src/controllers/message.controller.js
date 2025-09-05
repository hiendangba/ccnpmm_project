const messageServices = require("../services/message.service");
const MessageResponse = require("../dto/response/message.response.dto")
const ApiResponse = require("../dto/response/api.response.dto")

const messageController = {
  getOrCreateOneToOne: async (req, res) => {
      try {

        const senderId = req.user.id;
        const {receiverId } = req.query;
        let { page, limit } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;  
        const messages = await messageServices.getOrCreateOneToOne(senderId, receiverId, page, limit);
        console.log(messages)
        
        return  res.status(200).json(
                    new ApiResponse(messages.messages, {
                        page,
                        limit,
                        totalItems: messages.totalMessages,
                        DTOClass: MessageResponse}))   

        } catch (err) {
        //res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
          res.status(err.statusCode || 500).json({
            message: err.message || "Internal Server Error",
            status: err.statusCode || 500,
            errorCode: err.errorCode || "INTERNAL_ERROR"
          });
      }
  },
}

module.exports = messageController;
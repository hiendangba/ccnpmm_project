const friendServices = require("../services/friend.service");
const ApiResponse = require("../dto/response/api.response.dto")
const { SendFriendRequestDto, FriendActionDto } = require("../dto/request/friend.request.dto")
const { FriendRequestResponseDto, RemoveFriendResponseDto, FriendResponseDto, FriendAcceptResponseDto } = require("../dto/response/friend.response.dto");
const { getIO } = require("../config/socket");
const friendController = {
    sendRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const sendFriendRequestDto = new SendFriendRequestDto(req.body);
            const response = await friendServices.sendRequest(senderId, sendFriendRequestDto)
            let friendResponseDto;
            let result
            const io = getIO()
            if(senderId.toString() === response.senderId._id.toString()){
                friendResponseDto = new FriendResponseDto(response)
                result = new FriendAcceptResponseDto(response)
                io.to(response.receiverId._id.toString()).emit("sendRequest", friendResponseDto);
            }else{
                friendResponseDto = new FriendAcceptResponseDto(response)
                result = new FriendResponseDto(response)
                io.to(response.senderId._id.toString()).emit("acceptedFriend", friendResponseDto);
            }
            return res.status(200).json(new ApiResponse(result));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },

    acceptRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const friendActionDto = new FriendActionDto(req.body)
            const response = await friendServices.acceptRequest(senderId, friendActionDto)
            const friendAcceptResponseDto = new FriendAcceptResponseDto(response)
            const io = getIO()
            io.to(response.senderId.toString()).emit("acceptedFriend", friendAcceptResponseDto);
            return res.status(200).json(new ApiResponse(friendAcceptResponseDto));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },

    rejectRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const friendActionDto = new FriendActionDto(req.body)
            const response = await friendServices.rejectRequest(senderId, friendActionDto)
            const friendAcceptResponseDto = new FriendAcceptResponseDto(response)
            const io = getIO()
            io.to(response.senderId.toString()).emit("rejectedFriend", friendAcceptResponseDto);
            return res.status(200).json(new ApiResponse(friendAcceptResponseDto));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },

    cancelRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const friendActionDto = new FriendActionDto(req.params)
            const response = await friendServices.cancelRequest(senderId, friendActionDto)
            const friendResponseDto = new FriendResponseDto(response)
            const io = getIO()
            io.to(response.receiverId.toString()).emit("cancelFriend", friendResponseDto);
            return res.status(200).json(new ApiResponse(friendResponseDto));
            } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },

    removeFriend: async (req, res) => {
        try {
            const senderId = req.user.id;
            const friendActionDto = new FriendActionDto(req.params)
            const response = await friendServices.removeFriend(senderId, friendActionDto)
            let friendResponseDto;
            const io = getIO()
            if(senderId.toString() === response.senderId._id.toString()){
                friendResponseDto = new FriendResponseDto(response)
                io.to(response.receiverId._id.toString()).emit("removeFriend", friendResponseDto);
            }else{
                friendResponseDto = new FriendAcceptResponseDto(response)
                io.to(response.senderId._id.toString()).emit("removeFriend", friendResponseDto);
            }
            return res.status(200).json(new ApiResponse(friendResponseDto));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },   
    
    getReceivedRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const listFriendRequestReceived = await friendServices.getReceivedRequest(senderId);
            return res.status(200).json(new ApiResponse({
                listFriendRequestReceived: listFriendRequestReceived.map(m => new FriendResponseDto(m))
            }));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    }, 

    getSentRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const listFriendRequestSent = await friendServices.getSentRequest(senderId);
            return res.status(200).json(new ApiResponse({
                listFriendRequestSent: listFriendRequestSent.map(m => new FriendAcceptResponseDto(m))
            }));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    }, 

    getListFriend: async (req, res) => {
        try {
            const senderId = req.query.userId;
            const listFriend = await friendServices.getListFriend(senderId);
            return res.status(200).json(new ApiResponse({
                listFriend: listFriend.map(m => new FriendResponseDto(m))
            }));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    }, 
    
}

module.exports = friendController;
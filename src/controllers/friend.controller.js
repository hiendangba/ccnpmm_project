const friendServices = require("../services/friend.service");
const ApiResponse = require("../dto/response/api.response.dto")
const { SendFriendRequestDto, FriendActionDto } = require("../dto/request/friend.request.dto")
const { FriendRequestResponseDto, RemoveFriendResponseDto } = require("../dto/response/friend.response.dto");
const friendController = {
    sendRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const sendFriendRequestDto = new SendFriendRequestDto(req.body);
            const friendRequestResponseDto = new FriendRequestResponseDto(await friendServices.sendRequest(senderId, sendFriendRequestDto))
            return res.status(201).json(new ApiResponse(friendRequestResponseDto));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },

    acceptRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const friendActionDto = new FriendActionDto(req.body)
            const friendRequestResponseDto = new FriendRequestResponseDto(await friendServices.acceptRequest(senderId, friendActionDto))
            return res.status(200).json(new ApiResponse(friendRequestResponseDto));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },

    rejectRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const friendActionDto = new FriendActionDto(req.body)
            const friendRequestResponseDto = new FriendRequestResponseDto(await friendServices.rejectRequest(senderId, friendActionDto))
            return res.status(200).json(new ApiResponse(friendRequestResponseDto));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },

    cancelRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const friendActionDto = new FriendActionDto(req.body)
            const friendRequestResponseDto = new FriendRequestResponseDto(await friendServices.cancelRequest(senderId, friendActionDto))
            return res.status(200).json(new ApiResponse(friendRequestResponseDto));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },

    removeFriend: async (req, res) => {
        try {
            const senderId = req.user.id;
            const friendActionDto = new FriendActionDto(req.body)
            const removeFriendResponseDto = new RemoveFriendResponseDto(await friendServices.removeFriend(senderId, friendActionDto))
            return res.status(200).json(new ApiResponse(removeFriendResponseDto));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    },   
    
    getRequest: async (req, res) => {
        try {
            const senderId = req.user.id;
            const listFriendRequest = await friendServices.getRequest(senderId)
            return res.status(200).json(new ApiResponse({
                listFriendRequest: listFriendRequest.map(m => new FriendRequestResponseDto(m))
            }));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    }, 

    getListFriend: async (req, res) => {
        try {
            const senderId = req.user.id;
            const friendIds = await friendServices.getListFriend(senderId);
            return res.status(200).json(new ApiResponse({
                friendIds
            }));
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message, status: err.statusCode, errorCode: err.errorCode });
        }
    }, 
    
}

module.exports = friendController;
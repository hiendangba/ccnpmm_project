const FriendError = {
    CANNOT_ADD_SELF: {
        message: "Bạn không thể gửi lời mời kết bạn cho chính mình",
        statusCode: 400,
        errorCode: "CANNOT_ADD_SELF"
    },
    ALREADY_REQUESTED: {
        message: "Đã có lời mời kết bạn đang chờ xử lý",
        statusCode: 400,
        errorCode: "ALREADY_REQUESTED"
    },
    ALREADY_FRIENDS: {
        message: "Hai bạn đã là bạn bè",
        statusCode: 400,
        errorCode: "ALREADY_FRIENDS"
    },
    REQUEST_NOT_FOUND: {
        message: "Lời mời kết bạn không tồn tại",
        statusCode: 404,
        errorCode: "REQUEST_NOT_FOUND"
    },
    USER_NOT_FOUND: {
        message: "Người dùng không tồn tại",
        statusCode: 404,
        errorCode: "USER_NOT_FOUND"
    },
    REQUEST_REJECTED:{
        message: "Yêu cầu của bạn đã bị từ chối rồi",
        statusCode: 404,
        errorCode: "REQUEST_REJECTED"
    },
    ALREADY_NOT_FRIENDS:{
        message: "Hai bạn chưa là bạn bè không thể thực hiện hành động",
        statusCode: 404,
        errorCode: "ALREADY_NOT_FRIENDS",
    },

    STATUS_ERROR:{
        message: "status không hợp lệ",
        statusCode: 404,
        errorCode: "STATUS_ERROR"
    }
};

module.exports = FriendError;

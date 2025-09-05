const SocketError = {
    CONNECTION_FAILED: {
        message: "Kết nối Socket.IO thất bại",
        statusCode: 500,
        errorCode: "CONNECTION_FAILED"
    },
    INVALID_MESSAGE: {
        message: "Dữ liệu tin nhắn không hợp lệ",
        statusCode: 400,
        errorCode: "INVALID_MESSAGE"
    },
    USER_NOT_FOUND: {
        message: "Người nhận không tồn tại hoặc không online",
        statusCode: 404,
        errorCode: "USER_NOT_FOUND"
    },
    SERVER_ERROR: {
        message: "Lỗi server Socket.IO",
        statusCode: 500,
        errorCode: "SERVER_ERROR"
    }
};

module.exports = SocketError;
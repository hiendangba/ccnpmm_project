const MessageError = {
    EMPTY_MESSAGE: {
        message: "Message must have content or attachment",
        statusCode: 400,
        errorCode: "EMPTY_MESSAGE"
    },
    USER_NOT_IN_CONVERSATION: {
        message: "User not in conversation",
        statusCode: 403,
        errorCode: "USER_NOT_IN_CONVERSATION"
    },

    INVALID_MEMBERS: {
        message: "Group must have at least 2 members",
        statusCode: 400,
        errorCode: "INVALID_MEMBERS"
    },
    MESSAGE_NOT_FOUND: {
        message: "Message not found",
        statusCode: 404,
        errorCode: "MESSAGE_NOT_FOUND"
    }
};

module.exports = MessageError;
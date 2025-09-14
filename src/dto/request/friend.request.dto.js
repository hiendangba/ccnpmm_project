class SendFriendRequestDto {
  constructor(body) {
    this.receiverId = body.receiverId;              // người nhận lời mời
    this.message = body.message || null;            // lời nhắn kèm (nếu có)
  }
}

class FriendActionDto {
  constructor(body) {
    this.requestId = body.requestId; // ID của lời mời kết bạn
  }
}


module.exports = { SendFriendRequestDto, FriendActionDto };

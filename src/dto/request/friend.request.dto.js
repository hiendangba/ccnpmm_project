class SendFriendRequestDto {
  constructor(body) {
    this.receiverId = body.receiverId;
    this.message = body.message || null;        
  }
}

class FriendActionDto {
  constructor(body) {
    this.requestId = body.requestId;
  }
} 


module.exports = { SendFriendRequestDto, FriendActionDto };

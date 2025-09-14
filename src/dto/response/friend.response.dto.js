class FriendRequestResponseDto {
  constructor(body) {
    this.id = body._id;
    this.senderId = body.senderId;
    this.receiverId = body.receiverId;
    this.message = body.message;
    this.status = body.status;
    this.createdAt = body.createdAt;
  }
}

class RemoveFriendResponseDto{
    constructor(body){
        this.id = body._id;
        this.userA = body.userA;
        this.userB = body.userB;
    }
}

module.exports = { FriendRequestResponseDto, RemoveFriendResponseDto };
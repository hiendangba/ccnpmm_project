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

class FriendAcceptResponseDto{
  constructor(body){
    this.id = body._id;
    this.userId = body.receiverId._id;
    this.name = body.receiverId.name;
    this.avatar = body.senderId.avatar;
    this.status = body.status;
    this.message = body.message;
    this.createdAt = body.createdAt;
    this.updatedAt = body.updatedAt;
  }
}


class FriendResponseDto{
  constructor(body){
    this.id = body._id;
    this.userId = body.senderId._id;
    this.name = body.senderId.name;
    this.avatar = body.senderId.avatar;
    this.status = body.status;
    this.message = body.message;
    this.createdAt = body.createdAt;
    this.updatedAt = body.updatedAt;
  }
}

module.exports = { FriendRequestResponseDto, RemoveFriendResponseDto, FriendResponseDto, FriendAcceptResponseDto };
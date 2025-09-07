class MessageResponse {
  constructor(message) {
    this.id = message._id;
    this.senderId = message.senderId;
    this.content = message.content;
    this.type = message.type;
    this.attachments = message.attachments || [];
    this.reactions = message.reactions || []; 
    this.isDeletedForAll = message.isDeletedForAll;
    this.deletedBy = message.deletedBy || [];
    this.readBy = message.readBy;
    this.createdAt = message.createdAt;
    this.updatedAt = message.updatedAt;
  }
}

module.exports = MessageResponse;
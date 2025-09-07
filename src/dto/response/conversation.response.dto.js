class ConversationDTO{ 
 constructor(conversation) {
    this.conversationId = conversation._id;
    this.name = conversation.name;
    this.members = conversation.members;
    this.createdBy = conversation.createdBy;
    this.isGroup = conversation.isGroup;
    this.createdAt = conversation.createdAt;
  }
}

module.exports = ConversationDTO;
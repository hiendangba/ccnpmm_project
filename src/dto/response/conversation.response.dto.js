class ConversationDTO {
  constructor(conversation) {
    this.conversationId = conversation._id;
    this.name = conversation.name;
    this.createdBy = conversation.createdBy;
    this.isGroup = conversation.isGroup;
    this.avatar = conversation.avatar;
    this.createdAt = conversation.createdAt;

    // thêm nếu có lastMessage
    if (conversation.lastMessage) {
      this.lastMessage = {
        id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        attachments: conversation.lastMessage.attachments,
        senderId: conversation.lastMessage.senderId,
        createdAt: conversation.lastMessage.createdAt,
        readBy: conversation.lastMessage.readBy,
        type: conversation.lastMessage.type,
        callStatus: conversation.lastMessage.callStatus,
        startedAt: conversation.lastMessage.startedAt,
        endedAt: conversation.lastMessage.endedAt,
        duration: conversation.lastMessage.duration,
      };
    }
    // thêm nếu có members
    if (conversation.members) {
      this.members = conversation.members.map(m => ({
        id: m._id,
        name: m.name,
        avatar: m.avatar,
        // isOnline: m.isOnline || false
      }));
    }
  }
}

module.exports = ConversationDTO;

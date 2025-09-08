class SendMessageRequest {
    constructor(body) {
    this.conversationId = body.conversationId;
    this.content = body.content;
    this.type = body.type || "text";
    this.attachments = body.attachments || [];
    }
}

module.exports = {SendMessageRequest}
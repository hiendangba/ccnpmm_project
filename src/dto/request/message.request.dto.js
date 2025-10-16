class SendMessageRequest {
    constructor(body) {
        this.conversationId = body.conversationId;
        this.content = body.content;
        this.type = body.type || "text";
        this.attachments = body.attachments || [];
        this.startedAt = body.startedAt;
        this.endedAt = body.endedAt;
        this.callStatus = body.callStatus;
        this.duration = body.duration;
    }
}

class UpdateCallRequest {
    constructor(body) {
        this.conversationId = body.conversationId;
        this.callStatus = body.callStatus;
        this.startedAt = body.startedAt;
        this.endedAt = body.endedAt;
    }
}

module.exports = { SendMessageRequest, UpdateCallRequest }
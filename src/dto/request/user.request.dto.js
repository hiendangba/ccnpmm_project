class UpdateUserRequest {
    constructor(body) {
        this.name = body.name ?? null;
        this.dateOfBirth = body.dateOfBirth ?? null;
        this.gender = body.gender ?? null;
        this.bio = body.bio ?? null;
        this.address = body.address ?? null;
    }
}

class PostNewRequest{
    constructor(body){
        this.userId = body.userId ?? null;
        this.content = body.content ?? "";
        this.images = body.images ?? [];
        this.originalPostId = body.originalPostId ?? null;
        this.rootPostId = body.rootPostId ?? null;
    }
}

module.exports = { UpdateUserRequest, PostNewRequest } ;
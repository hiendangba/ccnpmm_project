class UpdateUserRequest {
    constructor(body) {
        this.name = body.name ?? null;
        this.age = body.age ?? null;
        this.gender = body.gender ?? null;
        this.bio = body.bio ?? null;
        this.address = body.address ?? null;
    }
}
module.exports = UpdateUserRequest;
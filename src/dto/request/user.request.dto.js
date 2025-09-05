class UpdateUserRequest {
    constructor(body) {
        this.name = body.name ?? null;
        this.dateOfBirth = body.dateOfBirth ?? null;
        this.gender = body.gender ?? null;
        this.bio = body.bio ?? null;
        this.address = body.address ?? null;
    }
}
module.exports = UpdateUserRequest;
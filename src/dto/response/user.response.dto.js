class UserResponse {
    constructor(user) {
        this.name = user.name;
        this.mssv = user.mssv;
        this.email = user.email;
        this.age = user.age ?? null;
        this.bio = user.bio ?? null;
        this.gender = user.gender ?? null;
        this.address = user.address ?? null;
        this.avatarUrl = user.avatar ?? null;
    }
}
module.exports = UserResponse;
class PostResponse {
    constructor(post) {
        this.id = post._id,         
        this.userId = post.userId,
        this.content = post.content,
        this.images = post.images,
        this.originalPostId = post.originalPostId,
        this.rootPostId = post.rootPostId,
        this.createdAt = post.createdAt
    }
}
module.exports = {PostResponse};
class PostResponse {
  constructor(post, currentUserId = null) {
    this.id = post._id;
    this.content = post.content;
    this.images = post.images || [];
    this.createdAt = post.createdAt;

    // user tạo post
    this.user = post.user
      ? {
          id: post.user._id,
          name: post.user.name,
        }
      : null;

    // like info
    this.likeCount = post.likeCount || 0;
    this.likeUsers = (post.likeUsers || []).map(u => ({
      id: u._id,
      name: u.name,
    }));

    // xác định current user có like chưa
    this.liked = currentUserId
      ? this.likeUsers.some(u => String(u.id) === String(currentUserId))
      : false;
  }
}


class LikePostResponse {
    constructor(like) {
        this.postId = like.postId;
        this.likeUser = { id: like.userId._id, name: like.userId.name };
        this.liked = !like.deleted;
        this.createdAt = like.createdAt;
        this.deletedAt = like.deletedAt;
    }
}
module.exports = { PostResponse, LikePostResponse };
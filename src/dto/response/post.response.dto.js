class PostResponse {
  constructor(post, currentUserId = null) {
    this.id = post.id;
    this.content = post.content;
    this.images = post.images || [];
    this.createdAt = post.createdAt;

    // user tạo post
    this.user = post.user ?
      {
        id: post.user._id,
        name: post.user.name,
      } :
      null;

    // like info
    this.likeCount = post.likeCount || 0;
    this.likes = (post.likes || []).map(like => ({
      id: like.id,
      createdAt: like.createdAt,
      user: {
        id: like.user._id,
        name: like.user.name
      }
    }));

    // comment info
    this.commentCount = post.commentCount || 0;
    this.commentUsers = (post.commentUsers || []).map(comment => ({
      id: comment.id,
      postId: comment.postId,
      content: comment.content,
      images: comment.images,
      parentCommentId: comment.parentCommentId,
      childs: comment.childs,
      user: {
        id: comment.user._id,
        name: comment.user.name
      },
      createdAt: comment.createdAt
    }))

    // xác định current user có like chưa
    this.liked = currentUserId ?
      this.likes.some(like => String(like.user.id) === String(currentUserId)) :
      false;
  }
}


class LikePostResponse {
  constructor(like) {
    this.id = like._id
    this.postId = like.postId;
    this.likeUser = {
      id: like.userId._id,
      name: like.userId.name
    };
    this.liked = !like.deleted;
    this.createdAt = like.createdAt;
    this.deletedAt = like.deletedAt;
  }
}

class CommentPostResponse {
  constructor(comment) {
    this.id = comment._id;
    this.postId = comment.postId;
    this.user = {
      id: comment.userId._id,
      name: comment.userId.name
    };
    this.content = comment.content;
    this.images = comment.images;
    this.parentCommentId = comment.parentCommentId;
    this.childs = comment?.childs ?? [];;
    this.createdAt = comment.createdAt;
  }
}

module.exports = {
  PostResponse,
  LikePostResponse,
  CommentPostResponse
};
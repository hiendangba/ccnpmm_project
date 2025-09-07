const PostError = {  

  USER_ID_REQUIRED: {
    message: "Thiếu userId trong yêu cầu.",
    statusCode: 400,
    errorCode: "USER_ID_REQUIRED"
  },

  POST_EMPTY: {
    message: "Bài viết phải có nội dung hoặc hình ảnh.",
    statusCode: 400,
    errorCode: "POST_EMPTY"
  },

  INVALID_CONTENT: {
    message: "Nội dung bài viết không hợp lệ (phải là chuỗi).",
    statusCode: 400,
    errorCode: "INVALID_CONTENT"
  },

  INVALID_IMAGES: {
    message: "Trường images không hợp lệ (phải là mảng).",
    statusCode: 400,
    errorCode: "INVALID_IMAGES"
  },

  INVALID_IMAGE_URL: {
    message: "Mỗi phần tử trong images phải là chuỗi (link ảnh).",
    statusCode: 400,
    errorCode: "INVALID_IMAGE_URL"
  },

  INVALID_ORIGINAL_POST_ID: {
    message: "originalPostId không hợp lệ.",
    statusCode: 400,
    errorCode: "INVALID_ORIGINAL_POST_ID"
  },

  INVALID_ROOT_POST_ID: {
    message: "rootPostId không hợp lệ.",
    statusCode: 400,
    errorCode: "INVALID_ROOT_POST_ID"
  }
};

module.exports = PostError;
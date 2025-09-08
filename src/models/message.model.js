const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  senderId: { type: String, required: true },
  content: { type: String, trim: true },
  type: { type: String, enum: ["text", "image",], default: "text" },
  attachments: [{ url: String, name: String }],
  reactions: [{ userId: String, type: String }],
  readBy: [{ type: String }], // danh sách userId đã đọc
  deletedBy: [{ type: String }], // mảng userId đã xóa
  isDeletedForAll: { type: Boolean, default: false }, // xóa với tất cả
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);

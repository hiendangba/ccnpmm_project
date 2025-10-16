const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  senderId: { type: String, required: true },
  content: { type: String, trim: true },
  type: { type: String, enum: ["text", "image", "call"], default: "text" },
  attachments: [{ url: String, name: String }],
  reactions: [{ userId: String, type: String }],
  readBy: [{ type: String }], // danh sách userId đã đọc
  deletedBy: [{ type: String }], // mảng userId đã xóa
  isDeletedForAll: { type: Boolean, default: false }, // xóa với tất cả


  callStatus: { type: String, enum: ["ended", "ongoing", "canceled", "rejected", "ringing"] },
  startedAt: { type: Date },
  endedAt: { type: Date },
  duration: { type: Number },

  joinedUsers: [{ type: String }],
  rejectedUsers: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  senderId: { type: String, required: true },
  content: { type: String, trim: true },
  type: { type: String, enum: ["text", "image",], default: "text" },
  attachments: [{ url: String, type: String, name: String }],
  reactions: [{ userId: String, type: String }],
  isRead: { type: Boolean, default: false },
  deletedBy: [{ type: String }], // mảng userId đã xóa
  isDeletedForAll: { type: Boolean, default: false }, // xóa với tất cả
  edited: { type: Boolean, default: false },
  deliveryStatus: { type: String, enum: ["sent", "delivered", "read"], default: "sent" }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);

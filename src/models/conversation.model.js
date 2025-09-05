const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  name: { type: String },          // Tên nhóm (chat nhóm). Chat 1-1 có thể để null
  isGroup: { type: Boolean, default: false }, // false = 1-1, true = nhóm
  members: [{ type: String, required: true }], // mảng userId tham gia
  createdBy: { type: String, required: true }, // userId người tạo
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    content: {
        type: String,
        default: ""
    },
    images: {
        type: [String],
        default: []
    },
    originalPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null,
        index: true
    },
    rootPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null,
        index: true
    },
    deleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true});

postSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);

const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
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

likeSchema.index({postId: 1, userId: 1}, {unique: true});


module.exports = mongoose.model("Like", likeSchema);

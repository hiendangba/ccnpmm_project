const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  userA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Đảm bảo 1 cặp bạn bè không trùng (dù A-B hay B-A)
friendshipSchema.index(
  { userA: 1, userB: 1 },
  { unique: true }
);

friendshipSchema.pre('save', function(next) {
  const ids = [this.userA.toString(), this.userB.toString()].sort();
  this.userA = ids[0];
  this.userB = ids[1];
  next();
});

const Friendship = mongoose.model('Friendship', friendshipSchema);
module.exports = Friendship;

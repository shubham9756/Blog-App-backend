const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "blog",
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }, 
  likes: {
    type: Number,
    default: 0,
  }
});

module.exports = mongoose.model("comment", CommentSchema);

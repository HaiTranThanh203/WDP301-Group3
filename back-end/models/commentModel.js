const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'User' },
    postId: { type: mongoose.Schema.ObjectId, ref: 'Post' },
    parentId: { type: mongoose.Schema.ObjectId, ref: 'Comment', default: null },
    hasParent: { type: Boolean, default: false },
    childrens: [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
    content: String,
    isEdited: { type: Boolean, default: false },
    tagInfo: {
      userId: { type: mongoose.Schema.ObjectId, ref: 'User' },
      tagName: String,
    },
    votes: { type: Map, of: String, default: {} }, // "like", "dislike"
    upVotes: { type: Number, default: 0 },
    downVotes: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

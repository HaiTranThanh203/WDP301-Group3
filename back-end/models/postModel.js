const mongoose = require('mongoose');
const Community = require('./communityModel');

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    communityId: { type: mongoose.Schema.ObjectId, ref: 'Community', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    media: [{ type: String }],
    commentCount: { type: Number, default: 0 },
    
    // ✅ Fix: Lưu dạng Map<String, String> để lưu "like" hoặc "dislike"
    votes: { type: Map, of: String, default: {} },
    
    // ✅ Thêm trường tổng like/dislike để dễ truy vấn
    upVotes: { type: Number, default: 0 },
    downVotes: { type: Number, default: 0 },

    isEdited: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Fix: Chỉ lọc bài viết có `isActive: true`
postSchema.pre(/^find/, function (next) {
  this.where({ isActive: { $ne: false } });
  next();
});

// ✅ Fix lỗi gọi `next()` trước `await`
postSchema.post('save', async function (doc, next) {
  try {
    await Community.findByIdAndUpdate(doc.communityId, {
      $inc: { postCount: 1 },
    });
    next();
  } catch (err) {
    return next(err);
  }
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;

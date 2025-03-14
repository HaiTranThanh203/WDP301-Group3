const mongoose = require('mongoose');
const User = require('./userModel');
const newsSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Types.ObjectId, ref: 'User' },

    image: String,
    title: String,
    content: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const News = mongoose.model('News', newsSchema);
module.exports = News;

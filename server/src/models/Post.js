const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    gameTitle: {
      type: String,
      default: 'Chung',
    },
    postType: {
      type: String,
      enum: ['discussion', 'guide', 'lfg', 'showcase', 'question'],
      default: 'discussion',
    },
    platform: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Tiêu đề bài viết tối đa 100 ký tự'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Nội dung bài viết tối đa 1000 ký tự'],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);

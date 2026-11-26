const Post = require('../models/Post');
const PostComment = require('../models/PostComment');
const asyncHandler = require('../utils/asyncHandler');

const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, posts] = await Promise.all([
    Post.countDocuments(),
    Post.find()
      .populate('user', 'username avatar level')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
  ]);

  res.json({
    success: true,
    count: posts.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: posts,
  });
});

const ALLOWED_POST_TYPES = ['discussion', 'guide', 'lfg', 'showcase', 'question'];
const MAX_POST_TITLE_LENGTH = 100;
const MAX_POST_CONTENT_LENGTH = 1000;
const MAX_COMMENT_LENGTH = 500;

const isSafePostImage = (val) => {
  if (!val) return true;
  if (/^https?:\/\/\S+$/i.test(val)) return true;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(val) && val.length <= 4 * 1024 * 1024) {
    return true;
  }
  return false;
};

const createPost = asyncHandler(async (req, res) => {
  const { title, content, gameTitle, postType, platform, imageUrl } = req.body;

  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const cleanContent = typeof content === 'string' ? content.trim() : '';

  if (!cleanTitle || !cleanContent) {
    return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung bài viết không được để trống' });
  }

  if (cleanTitle.length > MAX_POST_TITLE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Tiêu đề bài viết tối đa ${MAX_POST_TITLE_LENGTH} ký tự`,
    });
  }

  if (cleanContent.length > MAX_POST_CONTENT_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Nội dung bài viết tối đa ${MAX_POST_CONTENT_LENGTH} ký tự`,
    });
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để tạo bài viết' });
  }

  const cleanImage = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  if (!isSafePostImage(cleanImage)) {
    return res.status(400).json({ success: false, message: 'Ảnh đính kèm không hợp lệ hoặc vượt quá 3MB' });
  }

  const safePostType = ALLOWED_POST_TYPES.includes(postType) ? postType : 'discussion';

  const post = await Post.create({
    user: req.user._id,
    authorName: req.user.username || 'PlayVerse Gamer',
    authorAvatar: req.user.avatar || '',
    gameTitle: typeof gameTitle === 'string' && gameTitle.trim() ? gameTitle.trim().slice(0, 80) : 'Chung',
    postType: safePostType,
    platform: typeof platform === 'string' ? platform.trim().slice(0, 30) : '',
    imageUrl: cleanImage,
    title: cleanTitle,
    content: cleanContent,
  });

  res.status(201).json({
    success: true,
    data: post,
  });
});

const toggleLikePost = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để tương tác' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
  }

  const userIdStr = req.user._id.toString();
  const alreadyLiked = post.likes.some((id) => id.toString() === userIdStr);

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likes.push(req.user._id);
    post.likesCount += 1;
  }

  await post.save();

  res.json({
    success: true,
    likesCount: post.likesCount,
    isLiked: !alreadyLiked,
  });
});

const getPostComments = asyncHandler(async (req, res) => {
  const comments = await PostComment.find({ post: req.params.id })
    .populate('user', 'username avatar level')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: comments.length,
    data: comments,
  });
});

const addPostComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const cleanComment = typeof content === 'string' ? content.trim() : '';

  if (!cleanComment) {
    return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
  }

  if (cleanComment.length > MAX_COMMENT_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Nội dung bình luận tối đa ${MAX_COMMENT_LENGTH} ký tự`,
    });
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để bình luận' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
  }

  const comment = await PostComment.create({
    post: post._id,
    user: req.user._id,
    authorName: req.user.username || 'PlayVerse Gamer',
    authorAvatar: req.user.avatar || '',
    content: cleanComment,
  });

  post.commentsCount += 1;
  await post.save();

  res.status(201).json({
    success: true,
    data: comment,
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
  }

  if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài viết này' });
  }

  await Promise.all([
    Post.findByIdAndDelete(req.params.id),
    PostComment.deleteMany({ post: req.params.id }),
  ]);

  res.json({
    success: true,
    message: 'Xóa bài viết thành công',
  });
});

const deletePostComment = asyncHandler(async (req, res) => {
  const comment = await PostComment.findById(req.params.commentId);

  if (!comment) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
  }

  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bình luận này' });
  }

  await PostComment.findByIdAndDelete(req.params.commentId);
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

  res.json({
    success: true,
    message: 'Xóa bình luận thành công',
  });
});

module.exports = { getPosts, createPost, toggleLikePost, getPostComments, addPostComment, deletePost, deletePostComment };

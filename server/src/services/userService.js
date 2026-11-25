const User = require('../models/User');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Leaderboard = require('../models/Leaderboard');
const Post = require('../models/Post');
const PostComment = require('../models/PostComment');
const ApiError = require('../utils/ApiError');
const { escapeRegex } = require('../utils/regexUtils');

const listUsers = async ({ search, role, page = 1, limit = 20 }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const query = {};
  if (search && search.trim()) {
    const keyword = escapeRegex(search.trim());
    query.$or = [
      { username: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
    ];
  }
  if (role && ['user', 'admin'].includes(role)) {
    query.role = role;
  }

  const skip = (pageNum - 1) * limitNum;
  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
  ]);

  return {
    count: users.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: users,
  };
};

const updateUser = async (id, actorId, { username, role, points, level }) => {
  const user = await User.findById(id).select('-password -refreshTokens');
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng');
  }

  if (id === actorId && role && role !== 'admin') {
    throw new ApiError(400, 'Bạn không thể tự hạ quyền Admin của chính mình');
  }

  if (username !== undefined && username.trim()) {
    const cleanUsername = username.trim();
    const duplicate = await User.findOne({ username: cleanUsername, _id: { $ne: id } });
    if (duplicate) {
      throw new ApiError(400, 'Tên đăng nhập đã được sử dụng');
    }
    user.username = cleanUsername;
  }

  if (role && ['user', 'admin'].includes(role)) {
    user.role = role;
  }
  if (points !== undefined && !Number.isNaN(Number(points))) {
    user.points = Math.max(0, Number(points));
  }
  if (level !== undefined && !Number.isNaN(Number(level))) {
    user.level = Math.max(1, Number(level));
  }

  await user.save();
  return user;
};

const deleteUser = async (id, actorId) => {
  if (id === actorId) {
    throw new ApiError(400, 'Bạn không thể tự xóa tài khoản Admin đang đăng nhập');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng để xóa');
  }

  await Promise.all([
    User.findByIdAndDelete(id),
    Review.deleteMany({ user: id }),
    Wishlist.deleteMany({ user: id }),
    Leaderboard.deleteMany({ user: id }),
    Post.deleteMany({ user: id }),
    PostComment.deleteMany({ user: id }),
  ]);
};

module.exports = { listUsers, updateUser, deleteUser };

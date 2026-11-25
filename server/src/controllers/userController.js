const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Lấy danh sách tất cả người dùng (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.json({ success: true, ...result });
});

// @desc    Cập nhật thông tin / quyền người dùng (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.user._id.toString(), req.body);
  res.json({ success: true, message: 'Cập nhật người dùng thành công', data: user });
});

// @desc    Xóa người dùng và dữ liệu liên quan (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user._id.toString());
  res.json({ success: true, message: 'Đã xóa người dùng và toàn bộ dữ liệu liên quan' });
});

module.exports = {
  getUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
};

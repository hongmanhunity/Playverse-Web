const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Thiếu Bearer token xác thực' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không còn tồn tại' });
    }

    // Kiểm tra xem mật khẩu có bị đổi sau khi token được cấp phát hay không
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu tài khoản đã được thay đổi gần đây. Vui lòng đăng nhập lại.',
        code: 'PASSWORD_CHANGED',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access Token đã hết hạn',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
      code: 'INVALID_TOKEN',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      if (user && !user.changedPasswordAfter(decoded.iat)) {
        req.user = user;
      }
    } catch (error) {
      // Bỏ qua lỗi token nếu là optional auth
    }
  }

  next();
};

// Middleware phân quyền theo vai trò
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Quyền truy cập bị từ chối: tài khoản của bạn (${req.user ? req.user.role : 'khách'}) không có quyền thực hiện thao tác này`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };

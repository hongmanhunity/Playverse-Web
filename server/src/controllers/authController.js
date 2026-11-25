const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const { sendOtpEmail } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const { generateTokens, verifyRefreshToken, setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/tokenUtils');

/**
 * Lưu refresh token vào DB (tối đa 5 phiên hoạt động)
 */
const saveUserRefreshToken = async (user, refreshToken) => {
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens.shift(); // Xóa phiên cũ nhất nếu vượt quá 5 thiết bị
  }
  user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
  await user.save({ validateBeforeSave: false });
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Bước 1 Đăng ký: Kiểm tra dữ liệu & gửi mã OTP xác thực email
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp username, email và password' });
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!usernameRegex.test(cleanUsername)) {
    return res.status(400).json({
      success: false,
      message: 'Tên đăng nhập từ 3-30 ký tự và chỉ chứa chữ cái, số, dấu gạch dưới',
    });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Định dạng email không hợp lệ' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  const userExists = await User.findOne({ $or: [{ email: cleanEmail }, { username: cleanUsername }] });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'Email hoặc Tên đăng nhập đã được sử dụng' });
  }

  // Kiểm tra chống spam gửi lại OTP liên tục trong vòng 60 giây
  const existingPending = await OtpVerification.findOne({ email: cleanEmail });
  if (existingPending && Date.now() - existingPending.lastSentAt.getTime() < 60 * 1000) {
    const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - existingPending.lastSentAt.getTime())) / 1000);
    return res.status(429).json({
      success: false,
      message: `Vui lòng đợi ${waitSeconds} giây trước khi yêu cầu mã OTP mới`,
    });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  const passwordHash = await bcrypt.hash(password, 10);

  await OtpVerification.findOneAndUpdate(
    { email: cleanEmail },
    {
      email: cleanEmail,
      username: cleanUsername,
      passwordHash,
      otpHash,
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
    },
    { upsert: true, new: true }
  );

  const emailResult = await sendOtpEmail({
    to: cleanEmail,
    subject: 'PlayVerse — Mã xác thực đăng ký tài khoản',
    title: 'Xác thực địa chỉ Email',
    subtitle: `Xin chào <strong>${cleanUsername}</strong>, hãy nhập mã OTP 6 số dưới đây để hoàn tất đăng ký tài khoản PlayVerse:`,
    otp,
    expireMinutes: 10,
  });

  res.status(200).json({
    success: true,
    requiresOtp: true,
    message: emailResult.delivered
      ? `Mã OTP đã được gửi tới ${cleanEmail}. Vui lòng kiểm tra hộp thư.`
      : `Mã OTP xác thực đã được tạo cho ${cleanEmail}.`,
    data: {
      email: cleanEmail,
      ...(!emailResult.delivered && !env.isProduction ? { devOtp: otp } : {}),
    },
  });
});

// @desc    Bước 2 Đăng ký: Xác thực OTP và tạo tài khoản chính thức
// @route   POST /api/auth/verify-register-otp
// @access  Public
const verifyRegisterOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mã OTP' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const pending = await OtpVerification.findOne({ email: cleanEmail });

  if (!pending || pending.expiresAt.getTime() < Date.now()) {
    return res.status(400).json({
      success: false,
      message: 'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại mã mới.',
    });
  }

  if (pending.attempts >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Bạn đã nhập sai OTP quá 5 lần. Vui lòng bấm gửi lại mã OTP mới.',
    });
  }

  const incomingHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
  if (incomingHash !== pending.otpHash) {
    pending.attempts += 1;
    await pending.save();
    const remaining = Math.max(0, 5 - pending.attempts);
    return res.status(400).json({
      success: false,
      message: remaining > 0 ? `Mã OTP không chính xác (còn ${remaining} lần thử)` : 'Mã OTP đã bị khóa do sai quá 5 lần',
    });
  }

  const userExists = await User.findOne({ $or: [{ email: cleanEmail }, { username: pending.username }] });
  if (userExists) {
    await OtpVerification.deleteOne({ _id: pending._id });
    return res.status(400).json({ success: false, message: 'Email hoặc Tên đăng nhập đã được đăng ký trước đó' });
  }

  const user = new User({
    username: pending.username,
    email: cleanEmail,
    password: pending.passwordHash,
    isVerified: true,
  });
  user.$locals.skipPasswordHash = true;
  await user.save();

  await OtpVerification.deleteOne({ _id: pending._id });

  const { accessToken, refreshToken } = generateTokens(user);
  await saveUserRefreshToken(user, refreshToken);
  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Xác thực OTP và đăng ký tài khoản thành công',
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      points: user.points,
      level: user.level,
      role: user.role,
      accessToken,
      refreshToken,
      token: accessToken,
    },
  });
});

// @desc    Gửi lại mã OTP đăng ký (sau 60 giây)
// @route   POST /api/auth/resend-register-otp
// @access  Public
const resendRegisterOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const pending = await OtpVerification.findOne({ email: cleanEmail });
  if (!pending) {
    return res.status(404).json({
      success: false,
      message: 'Phiên đăng ký đã hết hạn, vui lòng điền lại thông tin đăng ký',
    });
  }

  const elapsed = Date.now() - pending.lastSentAt.getTime();
  if (elapsed < 60 * 1000) {
    const waitSeconds = Math.ceil((60 * 1000 - elapsed) / 1000);
    return res.status(429).json({
      success: false,
      message: `Vui lòng đợi ${waitSeconds} giây trước khi gửi lại mã`,
    });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  pending.otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  pending.attempts = 0;
  pending.lastSentAt = new Date();
  pending.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pending.save();

  const emailResult = await sendOtpEmail({
    to: cleanEmail,
    subject: 'PlayVerse — Mã OTP mới của bạn',
    title: 'Mã xác thực mới',
    subtitle: `Mã OTP mới để hoàn tất đăng ký tài khoản PlayVerse của bạn là:`,
    otp,
    expireMinutes: 10,
  });

  res.json({
    success: true,
    message: emailResult.delivered ? 'Đã gửi lại mã OTP mới vào email của bạn' : 'Đã tạo lại mã OTP mới',
    data: {
      email: cleanEmail,
      ...(!emailResult.delivered && !env.isProduction ? { devOtp: otp } : {}),
    },
  });
});

// @desc    Đăng nhập bằng Email/Password
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và password' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Định dạng email không hợp lệ' });
  }

  const user = await User.findOne({ email: cleanEmail }).select('+password +refreshTokens');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Email hoặc Mật khẩu không chính xác' });
  }

  if (user.isVerified === false) {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản chưa được xác thực email. Vui lòng xác thực OTP hoặc đăng ký lại.',
    });
  }

  const { accessToken, refreshToken } = generateTokens(user);
  await saveUserRefreshToken(user, refreshToken);
  setRefreshTokenCookie(res, refreshToken);

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      points: user.points,
      level: user.level,
      role: user.role,
      accessToken,
      refreshToken,
      token: accessToken,
    },
  });
});

// @desc    Làm mới Access Token bằng Refresh Token (Token Rotation)
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshTokenHandler = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Thiếu Refresh Token',
      code: 'REFRESH_TOKEN_REQUIRED',
    });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Refresh Token không hợp lệ hoặc đã hết hạn',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Người dùng không còn tồn tại trên hệ thống',
      code: 'USER_NOT_FOUND',
    });
  }

  // Kiểm tra Refresh Token trong danh sách các phiên còn hiệu lực của user
  const tokenIndex = (user.refreshTokens || []).findIndex((item) => item.token === incomingRefreshToken);

  // TOKEN REUSE DETECTION (Phát hiện tấn công dùng lại token bị đánh cắp)
  if (tokenIndex === -1) {
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });
    clearRefreshTokenCookie(res);

    return res.status(403).json({
      success: false,
      message: 'Phát hiện Refresh Token bất thường hoặc đã bị thu hồi. Toàn bộ phiên đăng nhập đã bị vô hiệu hóa để bảo vệ tài khoản.',
      code: 'TOKEN_REUSE_DETECTED',
    });
  }

  // Token Rotation: Xóa token cũ, cấp phát token mới
  user.refreshTokens.splice(tokenIndex, 1);

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
  user.refreshTokens.push({ token: newRefreshToken, createdAt: new Date() });
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, newRefreshToken);

  res.json({
    success: true,
    message: 'Làm mới Access Token thành công',
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      token: accessToken,
    },
  });
});

// @desc    Đăng xuất (Hủy Refresh Token và xóa cookie)
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (incomingRefreshToken) {
    try {
      const decoded = verifyRefreshToken(incomingRefreshToken);
      await User.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: { token: incomingRefreshToken } },
      });
    } catch (err) {
      // Bỏ qua lỗi verify nếu token đã hết hạn
    }
  }

  clearRefreshTokenCookie(res);

  res.json({
    success: true,
    message: 'Đăng xuất thành công',
  });
});

// @desc    Đăng nhập bằng Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, email: devEmail, name: devName, avatar: devAvatar, googleId: devGoogleId } = req.body;

  let email, name, avatar, googleId;

  if (idToken) {
    try {
      const client = new OAuth2Client(env.googleClientId);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.googleClientId || undefined,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email_verified) {
        return res.status(401).json({ success: false, message: 'Tài khoản Google chưa được xác minh' });
      }

      email = payload.email;
      name = payload.name;
      avatar = payload.picture;
      googleId = payload.sub;
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token xác thực Google không hợp lệ hoặc đã hết hạn' });
    }
  } else if (!env.isProduction && devEmail) {
    email = devEmail;
    name = devName;
    avatar = devAvatar;
    googleId = devGoogleId;
  } else {
    return res.status(400).json({ success: false, message: 'Thiếu idToken xác thực từ Google' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: cleanEmail }).select('+refreshTokens');

  if (!user) {
    const baseUsername = name
      ? name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      : cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const generatedUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

    const randomPassword = `Gg_${Math.random().toString(36).slice(-8)}!Pass`;

    user = await User.create({
      username: generatedUsername,
      email: cleanEmail,
      password: randomPassword,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      googleId: googleId || undefined,
    });
  } else if (googleId && !user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  const { accessToken, refreshToken } = generateTokens(user);
  await saveUserRefreshToken(user, refreshToken);
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Đăng nhập Google thành công',
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      points: user.points,
      level: user.level,
      role: user.role,
      accessToken,
      refreshToken,
      token: accessToken,
    },
  });
});

// @desc    Lấy thông tin cá nhân
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }
  res.json({
    success: true,
    data: user,
  });
});

// @desc    Cập nhật thông tin profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  if (avatar && avatar.trim()) {
    user.avatar = avatar.trim();
  }

  await user.save();

  res.json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      points: user.points,
      level: user.level,
      role: user.role,
    },
  });
});

// @desc    Đổi mật khẩu & thu hồi toàn bộ token cũ
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
    });
  }

  const user = await User.findById(req.user._id).select('+password +refreshTokens');
  if (!user || !(await user.matchPassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Mật khẩu hiện tại không chính xác',
    });
  }

  user.password = newPassword;
  // Thu hồi tất cả refresh token cũ trên tất cả các thiết bị
  user.refreshTokens = [];

  // Tạo cặp token mới cho phiên hiện tại
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
  user.refreshTokens.push({ token: newRefreshToken, createdAt: new Date() });

  await user.save();
  setRefreshTokenCookie(res, newRefreshToken);

  res.json({
    success: true,
    message: 'Đổi mật khẩu thành công. Các phiên đăng nhập trên thiết bị khác đã được thu hồi an toàn.',
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      token: accessToken,
    },
  });
});

// @desc    Yêu cầu mã khôi phục mật khẩu (OTP 6 số)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email.trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email hợp lệ' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này' });
  }

  const resetCode = crypto.randomInt(100000, 999999).toString();
  const hashedToken = crypto.createHash('sha256').update(resetCode).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendOtpEmail({
    to: cleanEmail,
    subject: 'PlayVerse — Mã khôi phục mật khẩu',
    title: 'Đặt lại mật khẩu',
    subtitle: 'Bạn vừa yêu cầu đặt lại mật khẩu tài khoản PlayVerse. Nhập mã OTP 6 số dưới đây:',
    otp: resetCode,
    expireMinutes: 15,
  });

  res.json({
    success: true,
    message: emailResult.delivered
      ? 'Mã xác nhận đã được gửi tới email của bạn (hiệu lực 15 phút)'
      : 'Mã xác nhận khôi phục mật khẩu đã được tạo (hiệu lực 15 phút)',
    ...(!emailResult.delivered && !env.isProduction ? { devResetCode: resetCode } : {}),
  });
});

// @desc    Đặt lại mật khẩu mới bằng mã OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ email, mã xác nhận và mật khẩu mới',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const hashedToken = crypto.createHash('sha256').update(String(code).trim()).digest('hex');

  const user = await User.findOne({
    email: cleanEmail,
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Mã xác nhận không chính xác hoặc đã hết hạn',
    });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshTokens = [];
  await user.save();

  res.json({
    success: true,
    message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
  });
});

module.exports = {
  registerUser, verifyRegisterOtp, resendRegisterOtp, loginUser,
  refreshTokenHandler, logoutUser, googleAuth, getUserProfile,
  updateProfile, changePassword, forgotPassword, resetPassword,
};

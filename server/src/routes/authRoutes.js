const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyRegisterOtp,
  resendRegisterOtp,
  loginUser,
  refreshTokenHandler,
  logoutUser,
  googleAuth,
  getUserProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/register', authLimiter, registerUser);
router.post('/verify-register-otp', authLimiter, verifyRegisterOtp);
router.post('/resend-register-otp', authLimiter, resendRegisterOtp);
router.post('/login', authLimiter, loginUser);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logoutUser);
router.post('/google', googleAuth);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

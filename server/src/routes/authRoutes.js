const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/register', authLimiter, authController.registerUser);
router.post('/verify-register-otp', authLimiter, authController.verifyRegisterOtp);
router.post('/resend-register-otp', authLimiter, authController.resendRegisterOtp);
router.post('/login', authLimiter, authController.loginUser);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/refresh-token', authController.refreshTokenHandler);
router.post('/logout', authController.logoutUser);
router.post('/google', authController.googleAuth);
router.get('/me', protect, authController.getUserProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;

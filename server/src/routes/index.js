const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/games', require('./gameRoutes'));
router.use('/banners', require('./bannerRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/leaderboards', require('./leaderboardRoutes'));
router.use('/wishlist', require('./wishlistRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/notifications', require('./notificationRoutes'));

module.exports = router;

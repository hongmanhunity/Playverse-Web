const express = require('express');
const router = express.Router();
const { getReviewsByGame, addReview, getAllReviews, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { reviewLimiter } = require('../middlewares/rateLimitMiddleware');

router.get('/', protect, authorize('admin'), getAllReviews);
router.delete('/:id', protect, authorize('admin'), deleteReview);

router.get('/game/:gameId', getReviewsByGame);
router.post('/game/:gameId', protect, reviewLimiter, addReview);

module.exports = router;

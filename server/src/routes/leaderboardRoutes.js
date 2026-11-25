const express = require('express');
const router = express.Router();
const { getGlobalLeaderboard, getGameLeaderboard, submitScore } = require('../controllers/leaderboardController');
const { protect } = require('../middlewares/authMiddleware');
const { scoreLimiter } = require('../middlewares/rateLimitMiddleware');

router.get('/global', getGlobalLeaderboard);
router.get('/game/:gameId', getGameLeaderboard);
router.post('/score', protect, scoreLimiter, submitScore);

module.exports = router;

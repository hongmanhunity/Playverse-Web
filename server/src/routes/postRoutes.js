const express = require('express');
const router = express.Router();
const { getPosts, createPost, toggleLikePost, getPostComments, addPostComment, deletePost, deletePostComment } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');
const { postLimiter } = require('../middlewares/rateLimitMiddleware');

router.get('/', getPosts);
router.post('/', protect, postLimiter, createPost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, toggleLikePost);
router.get('/:id/comments', getPostComments);
router.post('/:id/comments', protect, postLimiter, addPostComment);
router.delete('/comments/:commentId', protect, deletePostComment);

module.exports = router;

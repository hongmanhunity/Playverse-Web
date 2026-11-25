const express = require('express');
const router = express.Router();
const { getUsers, updateUserByAdmin, deleteUserByAdmin } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.route('/:id').put(updateUserByAdmin).delete(deleteUserByAdmin);

module.exports = router;

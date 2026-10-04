const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All user routes require authentication
router.use(protect);

router.route('/')
  .get(authorize('admin', 'staff'), getAllUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;

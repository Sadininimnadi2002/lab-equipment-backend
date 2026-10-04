const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin', 'staff'), createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, authorize('admin', 'staff'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;

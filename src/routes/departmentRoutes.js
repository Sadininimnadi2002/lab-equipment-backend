const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(getDepartments)
  .post(protect, authorize('admin', 'staff'), createDepartment);

router.route('/:id')
  .get(getDepartmentById)
  .put(protect, authorize('admin', 'staff'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

module.exports = router;

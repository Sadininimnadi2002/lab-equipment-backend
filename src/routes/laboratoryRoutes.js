const express = require('express');
const router = express.Router();
const {
  getLaboratories,
  getLaboratoryById,
  getLaboratoriesByDepartment,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
} = require('../controllers/laboratoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(getLaboratories)
  .post(protect, authorize('admin', 'staff'), createLaboratory);

router.route('/department/:departmentId')
  .get(getLaboratoriesByDepartment);

router.route('/:id')
  .get(getLaboratoryById)
  .put(protect, authorize('admin', 'staff'), updateLaboratory)
  .delete(protect, authorize('admin'), deleteLaboratory);

module.exports = router;

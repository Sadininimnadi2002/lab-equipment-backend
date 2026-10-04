const express = require('express');
const router = express.Router();
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');
const { checkEquipmentAvailability } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(getEquipment)
  .post(protect, authorize('admin', 'staff'), createEquipment);

router.get('/:id/availability', checkEquipmentAvailability);

router.route('/:id')
  .get(getEquipmentById)
  .put(protect, authorize('admin', 'staff'), updateEquipment)
  .delete(protect, authorize('admin'), deleteEquipment);

module.exports = router;

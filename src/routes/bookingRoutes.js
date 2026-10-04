const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
  markEquipmentCollected,
  markEquipmentReturned,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All booking routes require user authentication
router.use(protect);

// Student own bookings route (MUST be placed before /:id)
router.get('/my', getMyBookings);

// General bookings collection route
router
  .route('/')
  .post(createBooking)
  .get(authorize('admin', 'staff'), getAllBookings);

// Single booking route
router.route('/:id').get(getBookingById);

// Staff / Admin Approval and Rejection actions
router.patch('/:id/approve', authorize('admin', 'staff'), approveBooking);
router.patch('/:id/reject', authorize('admin', 'staff'), rejectBooking);

// Cancel booking (Student own or Staff/Admin)
router.patch('/:id/cancel', cancelBooking);

// Custody / Return tracking actions (Staff / Admin)
router.patch('/:id/collect', authorize('admin', 'staff'), markEquipmentCollected);
router.patch('/:id/return', authorize('admin', 'staff'), markEquipmentReturned);

module.exports = router;

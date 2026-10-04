const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');

/**
 * @desc    Create a new equipment booking request with conflict prevention
 * @route   POST /api/bookings
 * @access  Private (Student / Staff / Admin)
 */
const createBooking = async (req, res, next) => {
  try {
    const { equipment, startTime, endTime, purpose, notes } = req.body;

    if (!equipment || !startTime || !endTime || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide equipment, startTime, endTime, and purpose',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate date logic
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date/time format provided',
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Verify equipment exists and check operational status
    const targetEquipment = await Equipment.findById(equipment);
    if (!targetEquipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    if (targetEquipment.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Cannot book equipment: Currently under maintenance',
      });
    }

    if (targetEquipment.status === 'out-of-service') {
      return res.status(400).json({
        success: false,
        message: 'Cannot book equipment: Out of service',
      });
    }

    // Booking Conflict Prevention:
    // Collision condition: existing.startTime < newEndTime && existing.endTime > newStartTime
    const conflict = await Booking.findOne({
      equipment,
      status: { $in: ['pending', 'approved'] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).populate('user', 'name email');

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'This equipment is already reserved during the selected time period',
        conflictingBooking: {
          id: conflict._id,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          userName: conflict.user?.name || 'Another applicant',
        },
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      equipment,
      startTime: start,
      endTime: end,
      purpose: purpose.trim(),
      notes: notes ? notes.trim() : '',
      status: 'pending',
      returnStatus: 'not-collected',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email department studentId')
      .populate('equipment', 'equipmentName equipmentCode laboratory department image');

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in student's bookings
 * @route   GET /api/bookings/my
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { user: req.user._id };

    if (status) {
      query.status = status.toLowerCase();
    }

    const bookings = await Booking.find(query)
      .populate('equipment', 'equipmentName equipmentCode image department laboratory location')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (staff/admin) with filters
 * @route   GET /api/bookings
 * @access  Private (Staff / Admin)
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { status, equipment, user, returnStatus } = req.query;
    let query = {};

    if (status) {
      query.status = status.toLowerCase();
    }

    if (equipment) {
      query.equipment = equipment;
    }

    if (user) {
      query.user = user;
    }

    if (returnStatus) {
      query.returnStatus = returnStatus.toLowerCase();
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email department studentId phone')
      .populate('equipment', 'equipmentName equipmentCode department laboratory location')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email department studentId phone')
      .populate('equipment', 'equipmentName equipmentCode department laboratory location image')
      .populate('approvedBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Permission check: Students can only view their own bookings
    if (
      req.user.role === 'student' &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking record',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a booking request
 * @route   PATCH /api/bookings/:id/approve
 * @access  Private (Staff / Admin)
 */
const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already approved',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve a cancelled booking',
      });
    }

    // Re-verify no conflicts have been created in the meantime
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      equipment: booking.equipment,
      status: 'approved',
      startTime: { $lt: booking.endTime },
      endTime: { $gt: booking.startTime },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Cannot approve: Conflicting booking already approved for this time slot',
      });
    }

    booking.status = 'approved';
    booking.approvedBy = req.user._id;
    booking.rejectionReason = null;

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('equipment', 'equipmentName equipmentCode')
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Booking request approved successfully',
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a booking request
 * @route   PATCH /api/bookings/:id/reject
 * @access  Private (Staff / Admin)
 */
const rejectBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already completed booking',
      });
    }

    booking.status = 'rejected';
    booking.rejectionReason = reason || 'Reservation rejected by laboratory staff';
    booking.approvedBy = req.user._id;

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('equipment', 'equipmentName equipmentCode')
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Booking request rejected',
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking (Student own or Staff/Admin)
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Permission: Student can only cancel their own booking
    if (
      req.user.role === 'student' &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an already completed booking session',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark equipment collected / checked out
 * @route   PATCH /api/bookings/:id/collect
 * @access  Private (Staff / Admin)
 */
const markEquipmentCollected = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved bookings can be marked as collected',
      });
    }

    booking.returnStatus = 'collected';
    booking.collectedAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Equipment marked as collected',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark equipment returned / checked in
 * @route   PATCH /api/bookings/:id/return
 * @access  Private (Staff / Admin)
 */
const markEquipmentReturned = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.returnStatus !== 'collected') {
      return res.status(400).json({
        success: false,
        message: 'Equipment must be marked as collected before it can be returned',
      });
    }

    booking.returnStatus = 'returned';
    booking.returnedAt = new Date();
    booking.status = 'completed';

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Equipment successfully returned and session completed',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check equipment real-time availability and existing bookings
 * @route   GET /api/equipment/:id/availability
 * @access  Public
 */
const checkEquipmentAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, date } = req.query;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    // Check equipment operational status
    if (equipment.status === 'maintenance') {
      return res.status(200).json({
        success: true,
        available: false,
        reason: 'maintenance',
        message: 'Equipment is currently under maintenance',
      });
    }

    if (equipment.status === 'out-of-service') {
      return res.status(200).json({
        success: true,
        available: false,
        reason: 'out-of-service',
        message: 'Equipment is currently out of service',
      });
    }

    // If specific time window is provided, perform conflict check
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
      }

      const conflict = await Booking.findOne({
        equipment: id,
        status: { $in: ['pending', 'approved'] },
        startTime: { $lt: end },
        endTime: { $gt: start },
      }).populate('user', 'name');

      if (conflict) {
        return res.status(200).json({
          success: true,
          available: false,
          message: 'This equipment is already reserved during the selected time period',
          conflictingBooking: {
            id: conflict._id,
            startTime: conflict.startTime,
            endTime: conflict.endTime,
          },
        });
      }

      return res.status(200).json({
        success: true,
        available: true,
        message: 'Equipment is available for this time period',
      });
    }

    // If a specific date is provided, return reservations for that day
    let dateFilter = {};
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      dateFilter = {
        startTime: { $gte: dayStart, $lte: dayEnd },
      };
    } else {
      // Default: upcoming active bookings
      dateFilter = {
        endTime: { $gte: new Date() },
      };
    }

    const scheduledBookings = await Booking.find({
      equipment: id,
      status: { $in: ['pending', 'approved'] },
      ...dateFilter,
    })
      .select('startTime endTime status')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      available: true,
      equipmentStatus: equipment.status,
      scheduledBookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
  markEquipmentCollected,
  markEquipmentReturned,
  checkEquipmentAvailability,
};

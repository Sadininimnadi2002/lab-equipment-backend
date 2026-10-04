const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the user booking this equipment'],
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Please provide the equipment being booked'],
    },
    startTime: {
      type: Date,
      required: [true, 'Please provide booking start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please provide booking end time'],
    },
    purpose: {
      type: String,
      required: [true, 'Please provide academic or laboratory purpose'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    collectedAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    returnStatus: {
      type: String,
      enum: {
        values: ['not-collected', 'collected', 'returned', 'overdue'],
        message: '{VALUE} is not a valid return status',
      },
      default: 'not-collected',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and collision detection
bookingSchema.index({ equipment: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);

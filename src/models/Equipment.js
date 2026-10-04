const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    equipmentName: {
      type: String,
      required: [true, 'Please provide equipment name'],
      trim: true,
    },
    equipmentCode: {
      type: String,
      required: [true, 'Please provide equipment code/asset tag'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      default: 'N/A',
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please associate a department with this equipment'],
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
      required: [true, 'Please associate a laboratory with this equipment'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please associate an equipment category'],
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'booked', 'maintenance', 'out-of-service'],
        message: '{VALUE} is not a valid status. Allowed: available, booked, maintenance, out-of-service',
      },
      default: 'available',
    },
    condition: {
      type: String,
      enum: {
        values: ['good', 'minor-issue', 'damaged', 'requires-maintenance'],
        message: '{VALUE} is not a valid condition. Allowed: good, minor-issue, damaged, requires-maintenance',
      },
      default: 'good',
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Quantity cannot be negative'],
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Laboratory Bench',
    },
  },
  {
    timestamps: true,
  }
);

// Add index for fast searches
equipmentSchema.index({ equipmentName: 'text', equipmentCode: 'text', description: 'text' });

module.exports = mongoose.model('Equipment', equipmentSchema);

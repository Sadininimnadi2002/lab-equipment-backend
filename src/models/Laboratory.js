const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide laboratory name'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please assign a department to this laboratory'],
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Engineering Complex',
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Laboratory', laboratorySchema);

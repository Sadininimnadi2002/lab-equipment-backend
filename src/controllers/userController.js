const User = require('../models/User');

/**
 * @desc    Get all users with optional search and role filter
 * @route   GET /api/users
 * @access  Private (Staff / Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details or role
 * @route   PUT /api/users/:id
 * @access  Private (Self or Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, department, studentId, phone, role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Only admin can change roles or active statuses
    if (req.user.role !== 'admin' && (role || typeof isActive !== 'undefined')) {
      return res.status(403).json({
        success: false,
        message: 'Only administrator can modify roles or active statuses',
      });
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (studentId) user.studentId = studentId;
    if (phone) user.phone = phone;
    if (role && req.user.role === 'admin') user.role = role;
    if (typeof isActive !== 'undefined' && req.user.role === 'admin') user.isActive = isActive;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrator cannot delete their own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

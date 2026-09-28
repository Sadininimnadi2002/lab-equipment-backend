const Laboratory = require('../models/Laboratory');
const Department = require('../models/Department');

/**
 * @desc    Get all laboratories with populated department
 * @route   GET /api/laboratories
 * @access  Public
 */
const getLaboratories = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const laboratories = await Laboratory.find(query)
      .populate('department', 'name code')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: laboratories.length,
      data: laboratories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single laboratory by ID
 * @route   GET /api/laboratories/:id
 * @access  Public
 */
const getLaboratoryById = async (req, res, next) => {
  try {
    const laboratory = await Laboratory.findById(req.params.id).populate(
      'department',
      'name code description'
    );

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found',
      });
    }

    res.status(200).json({
      success: true,
      data: laboratory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all laboratories belonging to a department
 * @route   GET /api/laboratories/department/:departmentId
 * @access  Public
 */
const getLaboratoriesByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    // Verify department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    const laboratories = await Laboratory.find({ department: departmentId })
      .populate('department', 'name code')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: laboratories.length,
      department: dept.name,
      data: laboratories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new laboratory
 * @route   POST /api/laboratories
 * @access  Private (Admin / Staff)
 */
const createLaboratory = async (req, res, next) => {
  try {
    const { name, department, location, description, isActive } = req.body;

    if (!name || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide laboratory name and department ID',
      });
    }

    // Verify department exists
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(404).json({
        success: false,
        message: 'Assigned department does not exist',
      });
    }

    const laboratory = await Laboratory.create({
      name: name.trim(),
      department,
      location: location || 'Main Engineering Complex',
      description,
      isActive: typeof isActive !== 'undefined' ? isActive : true,
    });

    const populatedLab = await Laboratory.findById(laboratory._id).populate(
      'department',
      'name code'
    );

    res.status(201).json({
      success: true,
      message: 'Laboratory created successfully',
      data: populatedLab,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update laboratory details
 * @route   PUT /api/laboratories/:id
 * @access  Private (Admin / Staff)
 */
const updateLaboratory = async (req, res, next) => {
  try {
    const { name, department, location, description, isActive } = req.body;
    let laboratory = await Laboratory.findById(req.params.id);

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found',
      });
    }

    if (department) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        return res.status(404).json({
          success: false,
          message: 'Assigned department does not exist',
        });
      }
      laboratory.department = department;
    }

    if (name) laboratory.name = name.trim();
    if (location) laboratory.location = location.trim();
    if (typeof description !== 'undefined') laboratory.description = description;
    if (typeof isActive !== 'undefined') laboratory.isActive = isActive;

    await laboratory.save();

    const updatedLab = await Laboratory.findById(laboratory._id).populate(
      'department',
      'name code'
    );

    res.status(200).json({
      success: true,
      message: 'Laboratory updated successfully',
      data: updatedLab,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete laboratory
 * @route   DELETE /api/laboratories/:id
 * @access  Private (Admin only)
 */
const deleteLaboratory = async (req, res, next) => {
  try {
    const laboratory = await Laboratory.findById(req.params.id);

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found',
      });
    }

    await Laboratory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Laboratory deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLaboratories,
  getLaboratoryById,
  getLaboratoriesByDepartment,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
};

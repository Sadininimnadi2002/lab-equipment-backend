const Equipment = require('../models/Equipment');
const Department = require('../models/Department');
const Laboratory = require('../models/Laboratory');
const Category = require('../models/Category');

/**
 * @desc    Get all equipment with search and multi-filtering
 * @route   GET /api/equipment
 * @access  Public
 */
const getEquipment = async (req, res, next) => {
  try {
    const { search, department, laboratory, category, status, condition } = req.query;
    let query = {};

    // Search by equipment name, equipmentCode, or description
    if (search) {
      query.$or = [
        { equipmentName: { $regex: search, $options: 'i' } },
        { equipmentCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by department (ObjectId)
    if (department) {
      query.department = department;
    }

    // Filter by laboratory (ObjectId)
    if (laboratory) {
      query.laboratory = laboratory;
    }

    // Filter by category (ObjectId)
    if (category) {
      query.category = category;
    }

    // Filter by availability status ('available', 'booked', 'maintenance', 'out-of-service')
    if (status) {
      query.status = status.toLowerCase();
    }

    // Filter by condition ('good', 'minor-issue', 'damaged', 'requires-maintenance')
    if (condition) {
      query.condition = condition.toLowerCase();
    }

    const equipmentList = await Equipment.find(query)
      .populate('department', 'name code')
      .populate('laboratory', 'name location')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: equipmentList.length,
      data: equipmentList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single equipment by ID
 * @route   GET /api/equipment/:id
 * @access  Public
 */
const getEquipmentById = async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id)
      .populate('department', 'name code description')
      .populate('laboratory', 'name location description')
      .populate('category', 'name description');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register new laboratory equipment
 * @route   POST /api/equipment
 * @access  Private (Admin / Staff)
 */
const createEquipment = async (req, res, next) => {
  try {
    const {
      equipmentName,
      equipmentCode,
      serialNumber,
      description,
      image,
      department,
      laboratory,
      category,
      status,
      condition,
      quantity,
      location,
    } = req.body;

    if (!equipmentName || !equipmentCode || !department || !laboratory || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide equipmentName, equipmentCode, department, laboratory, and category',
      });
    }

    // Check duplicate equipmentCode
    const existingCode = await Equipment.findOne({
      equipmentCode: equipmentCode.trim().toUpperCase(),
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `An equipment with asset code '${equipmentCode}' already exists`,
      });
    }

    // Verify references exist
    const [deptExists, labExists, catExists] = await Promise.all([
      Department.findById(department),
      Laboratory.findById(laboratory),
      Category.findById(category),
    ]);

    if (!deptExists) {
      return res.status(404).json({ success: false, message: 'Referenced department does not exist' });
    }
    if (!labExists) {
      return res.status(404).json({ success: false, message: 'Referenced laboratory does not exist' });
    }
    if (!catExists) {
      return res.status(404).json({ success: false, message: 'Referenced category does not exist' });
    }

    const newEquipment = await Equipment.create({
      equipmentName: equipmentName.trim(),
      equipmentCode: equipmentCode.trim().toUpperCase(),
      serialNumber,
      description,
      image,
      department,
      laboratory,
      category,
      status: status || 'available',
      condition: condition || 'good',
      quantity: typeof quantity !== 'undefined' ? quantity : 1,
      location: location || 'Main Laboratory Bench',
    });

    const populatedEquipment = await Equipment.findById(newEquipment._id)
      .populate('department', 'name code')
      .populate('laboratory', 'name location')
      .populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Equipment registered successfully',
      data: populatedEquipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update equipment details
 * @route   PUT /api/equipment/:id
 * @access  Private (Admin / Staff)
 */
const updateEquipment = async (req, res, next) => {
  try {
    let item = await Equipment.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    const {
      equipmentName,
      equipmentCode,
      serialNumber,
      description,
      image,
      department,
      laboratory,
      category,
      status,
      condition,
      quantity,
      location,
    } = req.body;

    // Check code uniqueness if changing code
    if (equipmentCode && equipmentCode.trim().toUpperCase() !== item.equipmentCode) {
      const existing = await Equipment.findOne({
        equipmentCode: equipmentCode.trim().toUpperCase(),
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Equipment code '${equipmentCode}' is already taken`,
        });
      }
      item.equipmentCode = equipmentCode.trim().toUpperCase();
    }

    if (equipmentName) item.equipmentName = equipmentName.trim();
    if (typeof serialNumber !== 'undefined') item.serialNumber = serialNumber;
    if (typeof description !== 'undefined') item.description = description;
    if (typeof image !== 'undefined') item.image = image;
    if (department) item.department = department;
    if (laboratory) item.laboratory = laboratory;
    if (category) item.category = category;
    if (status) item.status = status.toLowerCase();
    if (condition) item.condition = condition.toLowerCase();
    if (typeof quantity !== 'undefined') item.quantity = quantity;
    if (location) item.location = location;

    await item.save();

    const updatedItem = await Equipment.findById(item._id)
      .populate('department', 'name code')
      .populate('laboratory', 'name location')
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete equipment
 * @route   DELETE /api/equipment/:id
 * @access  Private (Admin only)
 */
const deleteEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};

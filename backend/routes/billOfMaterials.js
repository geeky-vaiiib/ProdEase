const express = require('express');
const router = express.Router();
const BillOfMaterials = require('../models/BillOfMaterials');
const { protect, authorize } = require('../middleware/auth');
const { validate, bomSchemas } = require('../middleware/validation');

// @desc    Get all BOMs
// @route   GET /api/bom
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { finishedProduct: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const boms = await BillOfMaterials.find(filter)
      .populate('createdBy', 'username email')
      .populate('operations.workCenter', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BillOfMaterials.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: boms.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: boms
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single BOM
// @route   GET /api/bom/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const bom = await BillOfMaterials.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .populate('approvedBy', 'username email')
      .populate('operations.workCenter', 'name code type costPerHour');

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'Bill of Materials not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bom
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create BOM
// @route   POST /api/bom
// @access  Private (Manager, Admin)
router.post('/', protect, authorize('manager', 'admin'), validate(bomSchemas.create), async (req, res, next) => {
  try {
    const bomData = {
      ...req.body,
      createdBy: req.user.id
    };

    const bom = await BillOfMaterials.create(bomData);
    await bom.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Bill of Materials created successfully',
      data: bom
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update BOM
// @route   PUT /api/bom/:id
// @access  Private (Manager, Admin)
router.put('/:id', protect, authorize('manager', 'admin'), async (req, res, next) => {
  try {
    let bom = await BillOfMaterials.findById(req.params.id);

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'Bill of Materials not found'
      });
    }

    if (bom.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify active BOM. Create a new version instead.'
      });
    }

    bom = await BillOfMaterials.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email')
     .populate('updatedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Bill of Materials updated successfully',
      data: bom
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Approve BOM
// @route   PATCH /api/bom/:id/approve
// @access  Private (Manager, Admin)
router.patch('/:id/approve', protect, authorize('manager', 'admin'), async (req, res, next) => {
  try {
    const bom = await BillOfMaterials.findById(req.params.id);

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'Bill of Materials not found'
      });
    }

    if (bom.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft BOMs can be approved'
      });
    }

    bom.status = 'Active';
    bom.approvedBy = req.user.id;
    bom.approvedAt = new Date();
    bom.updatedBy = req.user.id;
    
    await bom.save();

    res.status(200).json({
      success: true,
      message: 'Bill of Materials approved successfully',
      data: bom
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete BOM
// @route   DELETE /api/bom/:id
// @access  Private (Manager, Admin)
router.delete('/:id', protect, authorize('manager', 'admin'), async (req, res, next) => {
  try {
    const bom = await BillOfMaterials.findById(req.params.id);

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'Bill of Materials not found'
      });
    }

    if (bom.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete active BOM'
      });
    }

    await BillOfMaterials.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Bill of Materials deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

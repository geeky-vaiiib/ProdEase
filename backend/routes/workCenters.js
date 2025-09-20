const express = require('express');
const router = express.Router();
const WorkCenter = require('../models/WorkCenter');
const { protect, authorize } = require('../middleware/auth');
const { validate, workCenterSchemas } = require('../middleware/validation');

// @desc    Get all work centers
// @route   GET /api/work-centers
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, type, search, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const workCenters = await WorkCenter.find(filter)
      .populate('operators', 'username email role')
      .populate('createdBy', 'username email')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WorkCenter.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: workCenters.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: workCenters
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single work center
// @route   GET /api/work-centers/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const workCenter = await WorkCenter.findById(req.params.id)
      .populate('operators', 'username email role')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .populate('maintenance.performedBy', 'username email');

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        message: 'Work center not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workCenter
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create work center
// @route   POST /api/work-centers
// @access  Private (Manager, Admin)
router.post('/', protect, authorize('manager', 'admin'), validate(workCenterSchemas.create), async (req, res, next) => {
  try {
    const workCenterData = {
      ...req.body,
      createdBy: req.user.id
    };

    const workCenter = await WorkCenter.create(workCenterData);
    await workCenter.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Work center created successfully',
      data: workCenter
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update work center
// @route   PUT /api/work-centers/:id
// @access  Private (Manager, Admin)
router.put('/:id', protect, authorize('manager', 'admin'), async (req, res, next) => {
  try {
    let workCenter = await WorkCenter.findById(req.params.id);

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        message: 'Work center not found'
      });
    }

    workCenter = await WorkCenter.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('operators', 'username email role')
     .populate('createdBy', 'username email')
     .populate('updatedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Work center updated successfully',
      data: workCenter
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update work center status
// @route   PATCH /api/work-centers/:id/status
// @access  Private (Manager, Admin, Operators)
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    
    if (!status || !['Active', 'Maintenance', 'Inactive', 'Broken'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const workCenter = await WorkCenter.findById(req.params.id);

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        message: 'Work center not found'
      });
    }

    // Check if user is authorized (operators can only report issues)
    const isOperator = req.user.role === 'operator';
    const canChangeStatus = ['admin', 'manager'].includes(req.user.role) || 
                           workCenter.operators.includes(req.user.id);

    if (!canChangeStatus) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change work center status'
      });
    }

    // Operators can only set to Maintenance or Broken
    if (isOperator && !['Maintenance', 'Broken'].includes(status)) {
      return res.status(403).json({
        success: false,
        message: 'Operators can only report maintenance or breakdown issues'
      });
    }

    // Update downtime if going to inactive status
    if (['Maintenance', 'Broken'].includes(status) && workCenter.status === 'Active') {
      workCenter.downtime.lastDowntime = new Date();
      if (reason) workCenter.downtime.reason = reason;
    }

    workCenter.status = status;
    workCenter.updatedBy = req.user.id;
    await workCenter.save();

    res.status(200).json({
      success: true,
      message: 'Work center status updated successfully',
      data: workCenter
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete work center
// @route   DELETE /api/work-centers/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const workCenter = await WorkCenter.findById(req.params.id);

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        message: 'Work center not found'
      });
    }

    await WorkCenter.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Work center deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

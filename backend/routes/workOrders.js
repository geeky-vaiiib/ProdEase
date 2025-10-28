const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/WorkOrder');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const { protect, authorize } = require('../middleware/auth');
const { validate, workOrderSchemas } = require('../middleware/validation');
const { consumeMaterialsForWO, updateMOProgress } = require('../utils/manufacturingFlow');

// @desc    Get all work orders
// @route   GET /api/work-orders
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const {
      status,
      assignee,
      workCenter,
      manufacturingOrderId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (workCenter) filter.workCenter = workCenter;
    if (manufacturingOrderId) filter.manufacturingOrderId = manufacturingOrderId;
    
    if (search) {
      filter.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { operationName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const workOrders = await WorkOrder.find(filter)
      .populate('assignee', 'username email role')
      .populate('workCenter', 'name code type')
      .populate('manufacturingOrderId', 'reference finishedProduct')
      .populate('createdBy', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await WorkOrder.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: workOrders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: workOrders
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single work order
// @route   GET /api/work-orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('assignee', 'username email role')
      .populate('workCenter', 'name code type costPerHour')
      .populate('manufacturingOrderId', 'reference finishedProduct quantity')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .populate('comments.author', 'username email');

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create work order
// @route   POST /api/work-orders
// @access  Private (Manager, Admin)
router.post('/', protect, authorize('manager', 'admin'), validate(workOrderSchemas.create), async (req, res, next) => {
  try {
    // Verify manufacturing order exists
    const manufacturingOrder = await ManufacturingOrder.findById(req.body.manufacturingOrderId);
    if (!manufacturingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing order not found'
      });
    }

    const workOrderData = {
      ...req.body,
      createdBy: req.user.id
    };

    const workOrder = await WorkOrder.create(workOrderData);

    // Add work order to manufacturing order
    manufacturingOrder.workOrders.push(workOrder._id);
    await manufacturingOrder.save();

    // Populate the created work order
    await workOrder.populate('assignee', 'username email role');
    await workOrder.populate('workCenter', 'name code type');
    await workOrder.populate('manufacturingOrderId', 'reference finishedProduct');

    res.status(201).json({
      success: true,
      message: 'Work order created successfully',
      data: workOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update work order
// @route   PUT /api/work-orders/:id
// @access  Private
router.put('/:id', protect, validate(workOrderSchemas.update), async (req, res, next) => {
  try {
    let workOrder = await WorkOrder.findById(req.params.id);

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   req.user.role === 'manager' || 
                   workOrder.assignee.toString() === req.user.id ||
                   workOrder.createdBy.toString() === req.user.id;

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this work order'
      });
    }

    // Update the work order
    workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('assignee', 'username email role')
     .populate('workCenter', 'name code type')
     .populate('manufacturingOrderId', 'reference finishedProduct');

    res.status(200).json({
      success: true,
      message: 'Work order updated successfully',
      data: workOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Start work order
// @route   PATCH /api/work-orders/:id/start
// @access  Private
router.patch('/:id/start', protect, async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    // Check if user can start this work order
    if (workOrder.assignee.toString() !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this work order'
      });
    }

    if (workOrder.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Work order cannot be started from current status'
      });
    }

    workOrder.status = 'In Progress';
    workOrder.startTime = new Date();
    workOrder.updatedBy = req.user.id;
    await workOrder.save();

    res.status(200).json({
      success: true,
      message: 'Work order started successfully',
      data: workOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Complete work order
// @route   PATCH /api/work-orders/:id/complete
// @access  Private
router.patch('/:id/complete', protect, async (req, res, next) => {
  try {
    const { realDuration, qualityCheck, materials } = req.body;

    const workOrder = await WorkOrder.findById(req.params.id);

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    // Check if user can complete this work order
    if (workOrder.assignee.toString() !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this work order'
      });
    }

    if (workOrder.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: 'Work order cannot be completed from current status'
      });
    }

    // Update work order with completion data
    workOrder.status = 'Completed';
    workOrder.endTime = new Date();
    if (realDuration) workOrder.realDuration = realDuration;
    if (qualityCheck) workOrder.qualityCheck = qualityCheck;

    // Update material consumption if provided
    if (materials && Array.isArray(materials)) {
      materials.forEach(material => {
        const woMaterial = workOrder.materials.find(m => m.materialId.toString() === material.materialId);
        if (woMaterial) {
          woMaterial.quantityConsumed = material.quantityConsumed || woMaterial.quantityRequired;
          woMaterial.quantityScrapped = material.quantityScrapped || 0;
        }
      });
    }

    workOrder.updatedBy = req.user.id;
    await workOrder.save();

    // Consume materials automatically
    try {
      const consumptions = await consumeMaterialsForWO(req.params.id, req.user.id);

      // Update manufacturing order progress
      await updateMOProgress(workOrder.manufacturingOrderId.toString());

      res.status(200).json({
        success: true,
        message: 'Work order completed successfully',
        data: workOrder,
        materialConsumptions: consumptions
      });
    } catch (consumptionError) {
      // Log the error but still return success for work order completion
      console.error('Material consumption error:', consumptionError);
      res.status(200).json({
        success: true,
        message: 'Work order completed successfully. Note: Material consumption failed.',
        data: workOrder,
        error: consumptionError.message
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Add comment to work order
// @route   POST /api/work-orders/:id/comments
// @access  Private
router.post('/:id/comments', protect, validate(workOrderSchemas.addComment), async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    const comment = {
      text: req.body.text,
      author: req.user.id,
      timestamp: new Date()
    };

    workOrder.comments.push(comment);
    await workOrder.save();

    // Populate the new comment
    await workOrder.populate('comments.author', 'username email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: workOrder.comments[workOrder.comments.length - 1]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

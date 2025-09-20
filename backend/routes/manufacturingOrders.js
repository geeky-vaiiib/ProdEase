const express = require('express');
const router = express.Router();
const ManufacturingOrder = require('../models/ManufacturingOrder');
const { protect, authorize } = require('../middleware/auth');
const { validate, manufacturingOrderSchemas } = require('../middleware/validation');

// @desc    Get all manufacturing orders
// @route   GET /api/manufacturing-orders
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const {
      status,
      assignee,
      priority,
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
    if (priority) filter.priority = priority;
    
    if (search) {
      filter.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { finishedProduct: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const manufacturingOrders = await ManufacturingOrder.find(filter)
      .populate('assignee', 'username email role')
      .populate('createdBy', 'username email')
      .populate('workOrders')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await ManufacturingOrder.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: manufacturingOrders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: manufacturingOrders
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single manufacturing order
// @route   GET /api/manufacturing-orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const manufacturingOrder = await ManufacturingOrder.findById(req.params.id)
      .populate('assignee', 'username email role')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .populate('workOrders')
      .populate('bomId');

    if (!manufacturingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: manufacturingOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create manufacturing order
// @route   POST /api/manufacturing-orders
// @access  Private (Manager, Admin)
router.post('/', protect, authorize('manager', 'admin'), validate(manufacturingOrderSchemas.create), async (req, res, next) => {
  try {
    const manufacturingOrderData = {
      ...req.body,
      createdBy: req.user.id
    };

    const manufacturingOrder = await ManufacturingOrder.create(manufacturingOrderData);

    // Populate the created order
    await manufacturingOrder.populate('assignee', 'username email role');
    await manufacturingOrder.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Manufacturing order created successfully',
      data: manufacturingOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update manufacturing order
// @route   PUT /api/manufacturing-orders/:id
// @access  Private (Manager, Admin, or assigned user)
router.put('/:id', protect, validate(manufacturingOrderSchemas.update), async (req, res, next) => {
  try {
    let manufacturingOrder = await ManufacturingOrder.findById(req.params.id);

    if (!manufacturingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing order not found'
      });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   req.user.role === 'manager' || 
                   manufacturingOrder.assignee.toString() === req.user.id ||
                   manufacturingOrder.createdBy.toString() === req.user.id;

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this manufacturing order'
      });
    }

    // Update the order
    manufacturingOrder = await ManufacturingOrder.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('assignee', 'username email role')
     .populate('createdBy', 'username email')
     .populate('updatedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Manufacturing order updated successfully',
      data: manufacturingOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete manufacturing order
// @route   DELETE /api/manufacturing-orders/:id
// @access  Private (Manager, Admin)
router.delete('/:id', protect, authorize('manager', 'admin'), async (req, res, next) => {
  try {
    const manufacturingOrder = await ManufacturingOrder.findById(req.params.id);

    if (!manufacturingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing order not found'
      });
    }

    // Check if order can be deleted (only Draft or Cancelled orders)
    if (!['Draft', 'Cancelled'].includes(manufacturingOrder.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete manufacturing order with current status'
      });
    }

    await ManufacturingOrder.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Manufacturing order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update manufacturing order status
// @route   PATCH /api/manufacturing-orders/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Draft', 'Confirmed', 'In Progress', 'To Close', 'Done', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    let manufacturingOrder = await ManufacturingOrder.findById(req.params.id);

    if (!manufacturingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing order not found'
      });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' || 
                     req.user.role === 'manager' || 
                     manufacturingOrder.assignee.toString() === req.user.id;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this manufacturing order status'
      });
    }

    // Update status and related fields
    const updateData = { status, updatedBy: req.user.id };
    
    if (status === 'In Progress' && !manufacturingOrder.actualStartDate) {
      updateData.actualStartDate = new Date();
    }
    
    if (status === 'Done' && !manufacturingOrder.actualEndDate) {
      updateData.actualEndDate = new Date();
      updateData.progress = 100;
    }

    manufacturingOrder = await ManufacturingOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignee', 'username email role');

    res.status(200).json({
      success: true,
      message: 'Manufacturing order status updated successfully',
      data: manufacturingOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get manufacturing order statistics
// @route   GET /api/manufacturing-orders/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res, next) => {
  try {
    const stats = await ManufacturingOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const totalOrders = await ManufacturingOrder.countDocuments();
    const overdueOrders = await ManufacturingOrder.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $nin: ['Done', 'Cancelled'] }
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        overdueOrders,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

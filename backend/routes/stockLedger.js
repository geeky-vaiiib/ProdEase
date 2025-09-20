const express = require('express');
const router = express.Router();
const StockLedger = require('../models/StockLedger');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all stock items
// @route   GET /api/stock-ledger
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, stockStatus, search, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { materialName: { $regex: search, $options: 'i' } },
        { materialCode: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let stockItems = await StockLedger.find(filter)
      .populate('createdBy', 'username email')
      .sort({ materialName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by stock status if provided
    if (stockStatus) {
      stockItems = stockItems.filter(item => item.stockStatus === stockStatus);
    }

    const total = await StockLedger.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: stockItems.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: stockItems
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single stock item
// @route   GET /api/stock-ledger/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const stockItem = await StockLedger.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .populate('transactions.performedBy', 'username email');

    if (!stockItem) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: stockItem
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create stock item
// @route   POST /api/stock-ledger
// @access  Private (Manager, Admin, Inventory)
router.post('/', protect, authorize('manager', 'admin', 'inventory'), async (req, res, next) => {
  try {
    const stockData = {
      ...req.body,
      createdBy: req.user.id
    };

    const stockItem = await StockLedger.create(stockData);
    await stockItem.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Stock item created successfully',
      data: stockItem
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update stock item
// @route   PUT /api/stock-ledger/:id
// @access  Private (Manager, Admin, Inventory)
router.put('/:id', protect, authorize('manager', 'admin', 'inventory'), async (req, res, next) => {
  try {
    let stockItem = await StockLedger.findById(req.params.id);

    if (!stockItem) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    stockItem = await StockLedger.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email')
     .populate('updatedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Stock item updated successfully',
      data: stockItem
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add stock transaction
// @route   POST /api/stock-ledger/:id/transaction
// @access  Private (Manager, Admin, Inventory)
router.post('/:id/transaction', protect, authorize('manager', 'admin', 'inventory'), async (req, res, next) => {
  try {
    const { type, quantity, unitCost, reference, referenceType, notes } = req.body;

    if (!type || !['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const stockItem = await StockLedger.findById(req.params.id);

    if (!stockItem) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    // Check if OUT transaction is possible
    if (type === 'OUT' && stockItem.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    const transactionData = {
      type,
      quantity,
      unitCost: unitCost || 0,
      reference: reference || `ADJ-${Date.now()}`,
      referenceType: referenceType || 'Adjustment',
      notes,
      performedBy: req.user.id
    };

    stockItem.addTransaction(transactionData);
    await stockItem.save();

    await stockItem.populate('transactions.performedBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      data: {
        stockItem,
        transaction: stockItem.transactions[stockItem.transactions.length - 1]
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get low stock items
// @route   GET /api/stock-ledger/alerts/low-stock
// @access  Private
router.get('/alerts/low-stock', protect, async (req, res, next) => {
  try {
    const lowStockItems = await StockLedger.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$reorderLevel'] }
    }).populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get stock statistics
// @route   GET /api/stock-ledger/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res, next) => {
  try {
    const totalItems = await StockLedger.countDocuments({ isActive: true });
    const lowStockItems = await StockLedger.countDocuments({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$reorderLevel'] }
    });
    const outOfStockItems = await StockLedger.countDocuments({
      isActive: true,
      currentStock: 0
    });

    const totalValue = await StockLedger.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$averageCost'] } } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Material validation schemas
const materialSchemas = {
  create: Joi.object({
    code: Joi.string().optional(),
    name: Joi.string().required(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().valid('Raw Material', 'Component', 'Finished Good', 'Consumable', 'Tool').required(),
    subcategory: Joi.string().optional(),
    unit: Joi.string().valid('pcs', 'kg', 'm', 'l', 'm2', 'm3', 'box', 'pack', 'set').required(),
    specifications: Joi.object({
      weight: Joi.number().optional(),
      dimensions: Joi.object({
        length: Joi.number().optional(),
        width: Joi.number().optional(),
        height: Joi.number().optional()
      }).optional(),
      color: Joi.string().optional(),
      grade: Joi.string().optional(),
      standard: Joi.string().optional()
    }).optional(),
    suppliers: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      code: Joi.string().optional(),
      leadTime: Joi.number().min(0).default(7),
      minOrderQuantity: Joi.number().min(1).default(1),
      unitCost: Joi.number().min(0).default(0),
      currency: Joi.string().default('USD'),
      contact: Joi.object({
        email: Joi.string().email().optional(),
        phone: Joi.string().optional()
      }).optional()
    })).default([]),
    inventory: Joi.object({
      currentStock: Joi.number().min(0).default(0),
      reorderLevel: Joi.number().min(0).default(0),
      maxStock: Joi.number().min(0).default(1000),
      averageCost: Joi.number().min(0).default(0),
      lastCost: Joi.number().min(0).default(0)
    }).default({}),
    location: Joi.object({
      warehouse: Joi.string().default('Main Warehouse'),
      zone: Joi.string().optional(),
      bin: Joi.string().optional(),
      shelf: Joi.string().optional()
    }).default({}),
    status: Joi.string().valid('Active', 'Inactive', 'Discontinued', 'Obsolete').default('Active'),
    quality: Joi.object({
      requiresInspection: Joi.boolean().default(false),
      shelfLife: Joi.number().optional(),
      expiryDate: Joi.date().optional(),
      batchTracking: Joi.boolean().default(false)
    }).default({}),
    cost: Joi.object({
      standardCost: Joi.number().min(0).default(0),
      lastPurchaseCost: Joi.number().min(0).default(0),
      movingAverageCost: Joi.number().min(0).default(0)
    }).default({})
  }),

  update: Joi.object({
    code: Joi.string().optional(),
    name: Joi.string().optional(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().valid('Raw Material', 'Component', 'Finished Good', 'Consumable', 'Tool').optional(),
    subcategory: Joi.string().optional(),
    unit: Joi.string().valid('pcs', 'kg', 'm', 'l', 'm2', 'm3', 'box', 'pack', 'set').optional(),
    specifications: Joi.object({
      weight: Joi.number().optional(),
      dimensions: Joi.object({
        length: Joi.number().optional(),
        width: Joi.number().optional(),
        height: Joi.number().optional()
      }).optional(),
      color: Joi.string().optional(),
      grade: Joi.string().optional(),
      standard: Joi.string().optional()
    }).optional(),
    suppliers: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      code: Joi.string().optional(),
      leadTime: Joi.number().min(0).default(7),
      minOrderQuantity: Joi.number().min(1).default(1),
      unitCost: Joi.number().min(0).default(0),
      currency: Joi.string().default('USD'),
      contact: Joi.object({
        email: Joi.string().email().optional(),
        phone: Joi.string().optional()
      }).optional()
    })).optional(),
    inventory: Joi.object({
      currentStock: Joi.number().min(0).optional(),
      reorderLevel: Joi.number().min(0).optional(),
      maxStock: Joi.number().min(0).optional(),
      averageCost: Joi.number().min(0).optional(),
      lastCost: Joi.number().min(0).optional()
    }).optional(),
    location: Joi.object({
      warehouse: Joi.string().optional(),
      zone: Joi.string().optional(),
      bin: Joi.string().optional(),
      shelf: Joi.string().optional()
    }).optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Discontinued', 'Obsolete').optional(),
    quality: Joi.object({
      requiresInspection: Joi.boolean().optional(),
      shelfLife: Joi.number().optional(),
      expiryDate: Joi.date().optional(),
      batchTracking: Joi.boolean().optional()
    }).optional(),
    cost: Joi.object({
      standardCost: Joi.number().min(0).optional(),
      lastPurchaseCost: Joi.number().min(0).optional(),
      movingAverageCost: Joi.number().min(0).optional()
    }).optional()
  })
};

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const {
      category,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const materials = await Material.find(filter)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Material.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: materials.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: materials
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create material
// @route   POST /api/materials
// @access  Private (Inventory, Admin)
router.post('/', protect, authorize('inventory', 'admin'), validate(materialSchemas.create), async (req, res, next) => {
  try {
    const materialData = {
      ...req.body,
      createdBy: req.user.id
    };

    const material = await Material.create(materialData);

    // Populate the created material
    await material.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: material
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private (Inventory, Admin)
router.put('/:id', protect, authorize('inventory', 'admin'), validate(materialSchemas.update), async (req, res, next) => {
  try {
    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Update the material
    material = await Material.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email')
     .populate('updatedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: material
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if material is being used in any BOM or MO
    const BillOfMaterials = require('../models/BillOfMaterials');
    const ManufacturingOrder = require('../models/ManufacturingOrder');

    const bomCount = await BillOfMaterials.countDocuments({
      'components.materialId': req.params.id
    });

    const moCount = await ManufacturingOrder.countDocuments({
      'components.materialId': req.params.id
    });

    if (bomCount > 0 || moCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete material that is being used in BOMs or Manufacturing Orders'
      });
    }

    await Material.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update material stock
// @route   PATCH /api/materials/:id/stock
// @access  Private (Inventory, Admin)
router.patch('/:id/stock', protect, authorize('inventory', 'admin'), async (req, res, next) => {
  try {
    const { quantity, type, reference, notes } = req.body;

    if (!quantity || !type) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and type are required'
      });
    }

    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Update stock
    const transaction = material.updateStock(quantity, type, reference || '', req.user.id);
    await material.save();

    // Log transaction in stock ledger
    const StockLedger = require('../models/StockLedger');
    await StockLedger.findOneAndUpdate(
      { materialId: material._id },
      {
        $push: { transactions: transaction },
        lastMovement: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Material stock updated successfully',
      data: {
        material,
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get low stock materials
// @route   GET /api/materials/low-stock
// @access  Private
router.get('/low-stock', protect, async (req, res, next) => {
  try {
    const lowStockMaterials = await Material.find({
      'inventory.currentStock': { $lte: '$inventory.reorderLevel' },
      status: 'Active'
    })
    .populate('createdBy', 'username email')
    .sort({ 'inventory.currentStock': 1 });

    res.status(200).json({
      success: true,
      count: lowStockMaterials.length,
      data: lowStockMaterials
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get material statistics
// @route   GET /api/materials/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res, next) => {
  try {
    const stats = await Material.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$inventory.totalValue' },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const totalMaterials = await Material.countDocuments();
    const activeMaterials = await Material.countDocuments({ status: 'Active' });
    const totalValue = await Material.aggregate([
      { $group: { _id: null, total: { $sum: '$inventory.totalValue' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMaterials,
        activeMaterials,
        totalValue: totalValue[0]?.total || 0,
        categoryBreakdown: stats,
        lowStockCount: stats.reduce((sum, cat) => sum + cat.lowStockCount, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

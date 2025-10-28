const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const WorkOrder = require('../models/WorkOrder');
const Material = require('../models/Material');
const WorkCenter = require('../models/WorkCenter');
const BillOfMaterials = require('../models/BillOfMaterials');
const StockLedger = require('../models/StockLedger');

// @desc    Get comprehensive dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', protect, async (req, res, next) => {
  try {
    const { startDate, endDate, workCenterId, status } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Manufacturing Orders Statistics
    const moStats = await ManufacturingOrder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const totalMOs = await ManufacturingOrder.countDocuments(dateFilter);
    const activeMOs = await ManufacturingOrder.countDocuments({ 
      ...dateFilter, 
      status: { $in: ['Confirmed', 'In Progress', 'To Close'] } 
    });
    const completedMOs = await ManufacturingOrder.countDocuments({ 
      ...dateFilter, 
      status: 'Done' 
    });
    const overdueMOs = await ManufacturingOrder.countDocuments({
      ...dateFilter,
      dueDate: { $lt: new Date() },
      status: { $nin: ['Done', 'Cancelled'] }
    });

    // Work Orders Statistics
    const woFilter = { ...dateFilter };
    if (workCenterId) woFilter.workCenter = workCenterId;
    if (status) woFilter.status = status;

    const woStats = await WorkOrder.aggregate([
      { $match: woFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: '$realDuration' },
          avgEfficiency: { 
            $avg: {
              $cond: [
                { $and: [{ $gt: ['$realDuration', 0] }, { $gt: ['$expectedDuration', 0] }] },
                { $multiply: [{ $divide: ['$expectedDuration', '$realDuration'] }, 100] },
                null
              ]
            }
          }
        }
      }
    ]);

    const totalWOs = await WorkOrder.countDocuments(woFilter);
    const pendingWOs = await WorkOrder.countDocuments({ ...woFilter, status: 'Pending' });
    const inProgressWOs = await WorkOrder.countDocuments({ ...woFilter, status: 'In Progress' });
    const completedWOs = await WorkOrder.countDocuments({ ...woFilter, status: 'Completed' });

    // Materials Statistics
    const totalMaterials = await Material.countDocuments({ status: 'Active' });
    const lowStockMaterials = await Material.countDocuments({
      status: 'Active',
      $expr: { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] }
    });
    const outOfStockMaterials = await Material.countDocuments({
      status: 'Active',
      'inventory.currentStock': 0
    });

    // Total inventory value
    const inventoryValue = await Material.aggregate([
      { $match: { status: 'Active' } },
      {
        $project: {
          value: {
            $multiply: ['$inventory.currentStock', '$inventory.averageCost']
          }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    // Work Centers Statistics
    const totalWorkCenters = await WorkCenter.countDocuments({ status: 'Active' });
    const maintenanceWorkCenters = await WorkCenter.countDocuments({ status: 'Maintenance' });
    const workCenterUtilization = await WorkOrder.aggregate([
      { $match: { status: { $in: ['In Progress', 'Completed'] } } },
      {
        $group: {
          _id: '$workCenter',
          totalHours: { $sum: { $divide: ['$realDuration', 60] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalHours: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'workcenters',
          localField: '_id',
          foreignField: '_id',
          as: 'workCenter'
        }
      },
      { $unwind: '$workCenter' },
      {
        $project: {
          name: '$workCenter.name',
          code: '$workCenter.code',
          totalHours: 1,
          orderCount: 1
        }
      }
    ]);

    // Production Trends (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const productionTrend = await ManufacturingOrder.aggregate([
      { 
        $match: { 
          actualEndDate: { $gte: last7Days },
          status: 'Done'
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$actualEndDate' } },
          count: { $sum: 1 },
          quantity: { $sum: '$quantityProduced' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Priority Distribution
    const priorityDistribution = await ManufacturingOrder.aggregate([
      { 
        $match: { 
          status: { $in: ['Confirmed', 'In Progress', 'To Close'] }
        } 
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // BOMs Statistics
    const totalBOMs = await BillOfMaterials.countDocuments();
    const activeBOMs = await BillOfMaterials.countDocuments({ status: 'Active' });

    // Recent Activities (last 10 completed work orders)
    const recentActivities = await WorkOrder.find({ status: 'Completed' })
      .sort({ endTime: -1 })
      .limit(10)
      .populate('assignee', 'username email')
      .populate('workCenter', 'name code')
      .populate('manufacturingOrderId', 'reference finishedProduct')
      .select('reference operationName endTime realDuration');

    // Response
    res.status(200).json({
      success: true,
      data: {
        manufacturingOrders: {
          total: totalMOs,
          active: activeMOs,
          completed: completedMOs,
          overdue: overdueMOs,
          statusBreakdown: moStats,
          priorityDistribution
        },
        workOrders: {
          total: totalWOs,
          pending: pendingWOs,
          inProgress: inProgressWOs,
          completed: completedWOs,
          statusBreakdown: woStats
        },
        materials: {
          total: totalMaterials,
          lowStock: lowStockMaterials,
          outOfStock: outOfStockMaterials,
          totalValue: inventoryValue[0]?.totalValue || 0
        },
        workCenters: {
          total: totalWorkCenters,
          maintenance: maintenanceWorkCenters,
          utilization: workCenterUtilization
        },
        boms: {
          total: totalBOMs,
          active: activeBOMs
        },
        trends: {
          production: productionTrend
        },
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get production performance metrics
// @route   GET /api/dashboard/performance
// @access  Private
router.get('/performance', protect, async (req, res, next) => {
  try {
    const { startDate, endDate, workCenterId } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.actualEndDate = {};
      if (startDate) dateFilter.actualEndDate.$gte = new Date(startDate);
      if (endDate) dateFilter.actualEndDate.$lte = new Date(endDate);
    }

    // Overall Efficiency
    const efficiencyMetrics = await WorkOrder.aggregate([
      { 
        $match: { 
          status: 'Completed',
          realDuration: { $gt: 0 },
          expectedDuration: { $gt: 0 },
          ...(workCenterId ? { workCenter: workCenterId } : {}),
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: null,
          avgEfficiency: {
            $avg: {
              $multiply: [{ $divide: ['$expectedDuration', '$realDuration'] }, 100]
            }
          },
          totalOrders: { $sum: 1 },
          totalExpectedTime: { $sum: '$expectedDuration' },
          totalRealTime: { $sum: '$realDuration' },
          onTimeOrders: {
            $sum: {
              $cond: [{ $lte: ['$realDuration', '$expectedDuration'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Quality Metrics
    const qualityMetrics = await WorkOrder.aggregate([
      { 
        $match: { 
          status: 'Completed',
          'qualityCheck.passed': { $ne: null },
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: null,
          totalInspected: { $sum: 1 },
          passed: {
            $sum: { $cond: [{ $eq: ['$qualityCheck.passed', true] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$qualityCheck.passed', false] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalInspected: 1,
          passed: 1,
          failed: 1,
          passRate: {
            $multiply: [{ $divide: ['$passed', '$totalInspected'] }, 100]
          }
        }
      }
    ]);

    // Manufacturing Order Completion Rate
    const moCompletionMetrics = await ManufacturingOrder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          },
          onTime: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$status', 'Done'] },
                    { $lte: ['$actualEndDate', '$dueDate'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          avgProgress: { $avg: '$progress' }
        }
      },
      {
        $project: {
          total: 1,
          completed: 1,
          cancelled: 1,
          onTime: 1,
          avgProgress: 1,
          completionRate: {
            $multiply: [{ $divide: ['$completed', '$total'] }, 100]
          },
          onTimeRate: {
            $multiply: [{ $divide: ['$onTime', '$completed'] }, 100]
          }
        }
      }
    ]);

    // Work Center Performance
    const workCenterPerformance = await WorkOrder.aggregate([
      { 
        $match: { 
          status: 'Completed',
          realDuration: { $gt: 0 },
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: '$workCenter',
          totalOrders: { $sum: 1 },
          avgEfficiency: {
            $avg: {
              $multiply: [{ $divide: ['$expectedDuration', '$realDuration'] }, 100]
            }
          },
          totalDowntime: { $sum: '$pausedTime' }
        }
      },
      { $sort: { avgEfficiency: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'workcenters',
          localField: '_id',
          foreignField: '_id',
          as: 'workCenter'
        }
      },
      { $unwind: '$workCenter' },
      {
        $project: {
          name: '$workCenter.name',
          code: '$workCenter.code',
          totalOrders: 1,
          avgEfficiency: 1,
          totalDowntime: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        efficiency: efficiencyMetrics[0] || {},
        quality: qualityMetrics[0] || {},
        completion: moCompletionMetrics[0] || {},
        workCenterPerformance
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get alerts and notifications
// @route   GET /api/dashboard/alerts
// @access  Private
router.get('/alerts', protect, async (req, res, next) => {
  try {
    const alerts = [];

    // Overdue Manufacturing Orders
    const overdueMOs = await ManufacturingOrder.find({
      dueDate: { $lt: new Date() },
      status: { $nin: ['Done', 'Cancelled'] }
    })
      .select('reference finishedProduct dueDate status')
      .populate('assignee', 'username email')
      .sort({ dueDate: 1 })
      .limit(10);

    if (overdueMOs.length > 0) {
      alerts.push({
        type: 'error',
        category: 'manufacturing',
        title: 'Overdue Manufacturing Orders',
        message: `${overdueMOs.length} manufacturing order(s) are overdue`,
        count: overdueMOs.length,
        data: overdueMOs
      });
    }

    // Low Stock Materials
    const lowStockMaterials = await Material.find({
      status: 'Active',
      $expr: { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] }
    })
      .select('name code inventory.currentStock inventory.reorderLevel')
      .sort({ 'inventory.currentStock': 1 })
      .limit(10);

    if (lowStockMaterials.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'inventory',
        title: 'Low Stock Materials',
        message: `${lowStockMaterials.length} material(s) are below reorder level`,
        count: lowStockMaterials.length,
        data: lowStockMaterials
      });
    }

    // Out of Stock Materials
    const outOfStockMaterials = await Material.find({
      status: 'Active',
      'inventory.currentStock': 0
    })
      .select('name code category')
      .limit(10);

    if (outOfStockMaterials.length > 0) {
      alerts.push({
        type: 'error',
        category: 'inventory',
        title: 'Out of Stock Materials',
        message: `${outOfStockMaterials.length} material(s) are out of stock`,
        count: outOfStockMaterials.length,
        data: outOfStockMaterials
      });
    }

    // Work Centers in Maintenance
    const maintenanceWCs = await WorkCenter.find({ status: 'Maintenance' })
      .select('name code type location')
      .limit(10);

    if (maintenanceWCs.length > 0) {
      alerts.push({
        type: 'info',
        category: 'workCenter',
        title: 'Work Centers Under Maintenance',
        message: `${maintenanceWCs.length} work center(s) are under maintenance`,
        count: maintenanceWCs.length,
        data: maintenanceWCs
      });
    }

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
});

// Legacy route for backward compatibility
router.get('/', protect, async (req, res) => {
  res.redirect('/api/dashboard/overview');
});

router.get('/stats', protect, async (req, res) => {
  res.redirect('/api/dashboard/performance');
});

module.exports = router;

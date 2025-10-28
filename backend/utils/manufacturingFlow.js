const ManufacturingOrder = require('../models/ManufacturingOrder');
const WorkOrder = require('../models/WorkOrder');
const BillOfMaterials = require('../models/BillOfMaterials');
const Material = require('../models/Material');
const StockLedger = require('../models/StockLedger');

/**
 * Generate work orders from a manufacturing order based on BOM operations
 */
const generateWorkOrdersFromMO = async (manufacturingOrderId, createdBy) => {
  try {
    const mo = await ManufacturingOrder.findById(manufacturingOrderId)
      .populate('bomId')
      .populate('assignee');

    if (!mo) {
      throw new Error('Manufacturing order not found');
    }

    if (!mo.bomId) {
      throw new Error('No BOM associated with this manufacturing order');
    }

    if (mo.workOrders && mo.workOrders.length > 0) {
      throw new Error('Work orders have already been generated for this manufacturing order');
    }

    const bom = mo.bomId;

    if (!bom.operations || bom.operations.length === 0) {
      throw new Error('BOM has no operations defined');
    }

    // Sort operations by sequence
    const sortedOperations = bom.operations.sort((a, b) => a.sequence - b.sequence);

    // Generate work orders for each operation in sequence
    const workOrders = [];
    for (const operation of sortedOperations) {
      // Prepare materials for this work order (distributed across operations or specific to this one)
      const requiredMaterials = bom.components.map(component => ({
        materialId: component.materialId,
        name: component.materialId.name || component.name || 'Unknown Material',
        quantityRequired: component.quantity * mo.quantity,
        unit: component.unit,
        unitCost: component.unitCost,
        wastePercentage: component.wastePercentage || 0
      }));

      const workOrderData = {
        manufacturingOrderId: mo._id,
        operationName: operation.name,
        workCenter: operation.workCenter,
        sequence: operation.sequence,
        expectedDuration: operation.duration,
        setupTime: operation.setupTime || 0,
        teardownTime: operation.teardownTime || 0,
        materials: requiredMaterials,
        assignee: mo.assignee._id,
        status: operation.sequence === 1 ? 'Ready' : 'Pending', // First operation is ready
        skillLevel: operation.skillRequired || 'Intermediate',
        qualityCheck: {
          required: operation.qualityCheckRequired || false
        },
        tools: operation.toolsRequired ? operation.toolsRequired.map(t => ({ name: t })) : [],
        createdBy: createdBy
      };

      const workOrder = await WorkOrder.create(workOrderData);
      workOrders.push(workOrder);
      mo.workOrders.push(workOrder._id);
    }

    // Update MO status to Confirmed once work orders are generated
    if (mo.status === 'Draft') {
      mo.status = 'Confirmed';
    }

    await mo.save();
    return workOrders;
  } catch (error) {
    console.error('Error in generateWorkOrdersFromMO:', error);
    throw error;
  }
};

/**
 * Reserve materials for a manufacturing order
 */
const reserveMaterialsForMO = async (manufacturingOrderId, reservedBy) => {
  try {
    const mo = await ManufacturingOrder.findById(manufacturingOrderId)
      .populate('components.materialId');

    if (!mo) {
      throw new Error('Manufacturing order not found');
    }

    if (mo.status === 'Cancelled') {
      throw new Error('Cannot reserve materials for cancelled manufacturing order');
    }

    const reservations = [];
    const errors = [];

    for (const component of mo.components) {
      try {
        const material = await Material.findById(component.materialId);
        if (!material) {
          errors.push(`Material not found: ${component.name}`);
          continue;
        }

        // Check if already reserved
        if (component.isReserved) {
          console.log(`Material ${component.name} already reserved`);
          continue;
        }

        // Calculate required quantity including waste
        const requiredQuantity = component.quantityRequired * (1 + (component.wastePercentage || 0) / 100);

        // Check if enough stock is available
        const availableStock = material.inventory.currentStock - material.inventory.reservedStock;
        if (availableStock < requiredQuantity) {
          errors.push(
            `Insufficient stock for material: ${component.name}. ` +
            `Available: ${availableStock} ${component.unit}, Required: ${requiredQuantity} ${component.unit}`
          );
          continue;
        }

        // Reserve the material
        material.inventory.reservedStock += requiredQuantity;
        material.inventory.availableStock = material.inventory.currentStock - material.inventory.reservedStock;
        await material.save();

        // Update component reservation
        component.quantityReserved = requiredQuantity;
        component.isReserved = true;
        component.reservedAt = new Date();

        const transaction = {
          type: 'RESERVE',
          quantity: requiredQuantity,
          unitCost: material.inventory.lastCost || component.unitCost,
          reference: mo.reference,
          referenceType: 'Manufacturing Order',
          notes: `Reserved for MO ${mo.reference}`,
          performedBy: reservedBy,
          timestamp: new Date()
        };

        reservations.push(transaction);

        // Log transaction in stock ledger
        await logStockTransaction(material, transaction);
      } catch (err) {
        errors.push(`Error reserving ${component.name}: ${err.message}`);
      }
    }

    await mo.save();

    if (errors.length > 0) {
      throw new Error(`Reservation completed with errors:\n${errors.join('\n')}`);
    }

    return reservations;
  } catch (error) {
    console.error('Error in reserveMaterialsForMO:', error);
    throw error;
  }
};

/**
 * Consume materials when work order is completed
 */
const consumeMaterialsForWO = async (workOrderId, consumedBy) => {
  try {
    const wo = await WorkOrder.findById(workOrderId)
      .populate('manufacturingOrderId')
      .populate('materials.materialId');

    if (!wo) {
      throw new Error('Work order not found');
    }

    const mo = wo.manufacturingOrderId;
    const consumptions = [];

    for (const material of wo.materials) {
      const materialDoc = await Material.findById(material.materialId);
      if (!materialDoc) {
        throw new Error(`Material not found: ${material.name}`);
      }

      // Unreserve the previously reserved quantity
      await materialDoc.updateStock(material.quantityReserved || 0, 'UNRESERVE', wo.reference, consumedBy);
      await materialDoc.save();

      // Consume the actual quantity used
      const consumeQuantity = material.quantityConsumed || material.quantityRequired;
      const transaction = materialDoc.updateStock(consumeQuantity, 'OUT', wo.reference, consumedBy);
      consumptions.push(transaction);

      await materialDoc.save();

      // Update work order material consumption
      material.quantityConsumed = consumeQuantity;
      await wo.save();

      // Update manufacturing order component consumption
      const moComponent = mo.components.find(c => c.materialId.toString() === material.materialId.toString());
      if (moComponent) {
        moComponent.quantityConsumed = (moComponent.quantityConsumed || 0) + consumeQuantity;
        await mo.save();
      }

      // Log transaction in stock ledger
      await logStockTransaction(materialDoc, transaction);
    }

    return consumptions;
  } catch (error) {
    throw error;
  }
};

/**
 * Complete manufacturing order and update stock
 */
const completeManufacturingOrder = async (manufacturingOrderId, completedBy) => {
  try {
    const mo = await ManufacturingOrder.findById(manufacturingOrderId)
      .populate('workOrders')
      .populate('components.materialId');

    if (!mo) {
      throw new Error('Manufacturing order not found');
    }

    // Check if all work orders are completed
    const incompleteWOs = mo.workOrders.filter(wo => wo.status !== 'Completed');
    if (incompleteWOs.length > 0) {
      throw new Error('Cannot complete MO: Not all work orders are completed');
    }

    // Update MO status
    mo.status = 'Done';
    mo.actualEndDate = new Date();
    mo.progress = 100;
    mo.updatedBy = completedBy;
    await mo.save();

    // Add finished goods to inventory (if it's a finished good)
    const finishedProductMaterial = await Material.findOne({
      name: mo.finishedProduct,
      category: 'Finished Good'
    });

    if (finishedProductMaterial) {
      const transaction = finishedProductMaterial.updateStock(mo.quantity, 'IN', mo.reference, completedBy);
      await finishedProductMaterial.save();
      await logStockTransaction(finishedProductMaterial, transaction);
    }

    return mo;
  } catch (error) {
    throw error;
  }
};

/**
 * Log stock transaction in stock ledger
 */
const logStockTransaction = async (material, transaction) => {
  try {
    let stockLedger = await StockLedger.findOne({ materialId: material._id });

    if (!stockLedger) {
      stockLedger = await StockLedger.create({
        materialId: material._id,
        materialName: material.name,
        materialCode: material.code,
        createdBy: transaction.performedBy
      });
    }

    stockLedger.addTransaction(transaction);
    await stockLedger.save();

    return stockLedger;
  } catch (error) {
    throw error;
  }
};

/**
 * Create manufacturing order from BOM
 */
const createMOFromBOM = async (bomId, moData, createdBy) => {
  try {
    const bom = await BillOfMaterials.findById(bomId)
      .populate('components.materialId');

    if (!bom) {
      throw new Error('BOM not found');
    }

    console.log('BOM found:', bom.finishedProduct);

    // Create components array for MO
    const components = bom.components.map(component => ({
      materialId: component.materialId._id,
      name: component.materialId.name,
      quantityRequired: component.quantity * moData.quantity,
      unit: component.unit,
      unitCost: component.unitCost,
      wastePercentage: component.wastePercentage
    }));

    // Create manufacturing order
    const manufacturingOrderData = {
      ...moData,
      finishedProduct: bom.finishedProduct,
      bomId: bom._id,
      components,
      createdBy: createdBy
    };

    console.log('Creating MO with data:', manufacturingOrderData);

    const manufacturingOrder = await ManufacturingOrder.create(manufacturingOrderData);

    return manufacturingOrder;
  } catch (error) {
    console.error('Error in createMOFromBOM:', error);
    throw error;
  }
};

/**
 * Update manufacturing order progress based on work orders
 */
const updateMOProgress = async (manufacturingOrderId) => {
  try {
    const mo = await ManufacturingOrder.findById(manufacturingOrderId)
      .populate('workOrders');

    if (!mo) {
      throw new Error('Manufacturing order not found');
    }

    if (mo.workOrders.length === 0) {
      return mo;
    }

    // Calculate progress based on completed work orders
    const completedWOs = mo.workOrders.filter(wo => wo.status === 'Completed').length;
    const progress = Math.round((completedWOs / mo.workOrders.length) * 100);

    mo.progress = progress;

    // Update status based on progress
    if (progress === 0 && mo.status === 'Draft') {
      mo.status = 'Confirmed';
    } else if (progress > 0 && progress < 100) {
      mo.status = 'In Progress';
      if (!mo.actualStartDate) {
        mo.actualStartDate = new Date();
      }
    } else if (progress === 100) {
      mo.status = 'To Close';
    }

    await mo.save();
    return mo;
  } catch (error) {
    console.error('Error in updateMOProgress:', error);
    throw error;
  }
};

/**
 * Update next work order status to Ready when previous is completed
 */
const updateNextWorkOrderStatus = async (completedWorkOrderId) => {
  try {
    const completedWO = await WorkOrder.findById(completedWorkOrderId);
    if (!completedWO) {
      throw new Error('Work order not found');
    }

    // Find the next work order in sequence
    const nextWO = await WorkOrder.findOne({
      manufacturingOrderId: completedWO.manufacturingOrderId,
      sequence: completedWO.sequence + 1,
      status: 'Pending'
    });

    if (nextWO) {
      nextWO.status = 'Ready';
      await nextWO.save();
      return nextWO;
    }

    return null;
  } catch (error) {
    console.error('Error in updateNextWorkOrderStatus:', error);
    throw error;
  }
};

/**
 * Cancel manufacturing order and unreserve materials
 */
const cancelManufacturingOrder = async (manufacturingOrderId, cancelledBy, reason) => {
  try {
    const mo = await ManufacturingOrder.findById(manufacturingOrderId)
      .populate('workOrders');

    if (!mo) {
      throw new Error('Manufacturing order not found');
    }

    if (mo.status === 'Done') {
      throw new Error('Cannot cancel completed manufacturing order');
    }

    // Unreserve all materials
    for (const component of mo.components) {
      if (component.isReserved && component.quantityReserved > 0) {
        const material = await Material.findById(component.materialId);
        if (material) {
          material.inventory.reservedStock = Math.max(
            0,
            material.inventory.reservedStock - component.quantityReserved
          );
          material.inventory.availableStock = material.inventory.currentStock - material.inventory.reservedStock;
          await material.save();

          // Log unreservation
          const transaction = {
            type: 'UNRESERVE',
            quantity: component.quantityReserved,
            unitCost: component.unitCost,
            reference: mo.reference,
            referenceType: 'Manufacturing Order',
            notes: `Unreserved due to MO cancellation: ${reason || 'No reason provided'}`,
            performedBy: cancelledBy,
            timestamp: new Date()
          };
          await logStockTransaction(material, transaction);
        }

        component.isReserved = false;
        component.quantityReserved = 0;
      }
    }

    // Cancel all pending work orders
    for (const wo of mo.workOrders) {
      if (['Pending', 'Ready'].includes(wo.status)) {
        wo.status = 'Cancelled';
        await wo.save();
      }
    }

    mo.status = 'Cancelled';
    mo.cancellationReason = reason || 'No reason provided';
    mo.updatedBy = cancelledBy;
    await mo.save();

    return mo;
  } catch (error) {
    console.error('Error in cancelManufacturingOrder:', error);
    throw error;
  }
};

module.exports = {
  generateWorkOrdersFromMO,
  reserveMaterialsForMO,
  consumeMaterialsForWO,
  completeManufacturingOrder,
  logStockTransaction,
  createMOFromBOM,
  updateMOProgress,
  updateNextWorkOrderStatus,
  cancelManufacturingOrder
};

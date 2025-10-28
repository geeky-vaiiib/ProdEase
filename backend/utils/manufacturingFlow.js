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

    const bom = mo.bomId;

    // Generate work orders for each operation in sequence
    const workOrders = [];
    for (let i = 0; i < bom.operations.length; i++) {
      const operation = bom.operations[i];

      // Calculate material requirements for this operation
      const requiredMaterials = bom.components.map(component => ({
        materialId: component.materialId,
        name: component.name,
        quantityRequired: component.quantity * mo.quantity,
        unit: component.unit,
        unitCost: component.unitCost,
        wastePercentage: component.wastePercentage
      }));

      const workOrder = await WorkOrder.create({
        manufacturingOrderId: mo._id,
        operationName: operation.name,
        workCenter: operation.workCenter,
        sequence: operation.sequence,
        expectedDuration: operation.duration,
        setupTime: operation.setupTime,
        description: operation.description,
        skillRequired: operation.skillRequired,
        materials: requiredMaterials,
        assignee: mo.assignee._id,
        createdBy: createdBy
      });

      workOrders.push(workOrder);
      mo.workOrders.push(workOrder._id);
    }

    await mo.save();
    return workOrders;
  } catch (error) {
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

    const reservations = [];

    for (const component of mo.components) {
      const material = await Material.findById(component.materialId);
      if (!material) {
        throw new Error(`Material not found: ${component.name}`);
      }

      // Check if enough stock is available
      const requiredQuantity = component.quantityRequired * (1 + component.wastePercentage / 100);
      if (material.availableStock < requiredQuantity) {
        throw new Error(`Insufficient stock for material: ${component.name}. Available: ${material.availableStock}, Required: ${requiredQuantity}`);
      }

      // Reserve the material
      const transaction = material.updateStock(requiredQuantity, 'RESERVE', mo.reference, reservedBy);
      reservations.push(transaction);

      await material.save();

      // Update component reservation
      component.quantityReserved = requiredQuantity;
      await mo.save();

      // Log transaction in stock ledger
      await logStockTransaction(material, transaction);
    }

    return reservations;
  } catch (error) {
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
    if (progress === 0) {
      mo.status = 'Confirmed';
    } else if (progress === 100) {
      mo.status = 'To Close';
    } else {
      mo.status = 'In Progress';
    }

    await mo.save();
    return mo;
  } catch (error) {
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
  updateMOProgress
};

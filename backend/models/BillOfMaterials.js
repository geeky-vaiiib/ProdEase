const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: [true, 'Material ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.001, 'Quantity must be greater than 0']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pcs', 'kg', 'm', 'l', 'm2', 'm3', 'box', 'pack', 'set']
  },
  unitCost: {
    type: Number,
    default: 0,
    min: 0
  },
  wastePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCritical: {
    type: Boolean,
    default: false
  },
  alternativeMaterials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  }],
  notes: {
    type: String,
    maxlength: 200
  }
});

const operationSchema = new mongoose.Schema({
  sequence: {
    type: Number,
    required: [true, 'Operation sequence is required'],
    min: [1, 'Sequence must be at least 1']
  },
  name: {
    type: String,
    required: [true, 'Operation name is required'],
    trim: true
  },
  workCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter',
    required: [true, 'Work center is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  setupTime: {
    type: Number, // in minutes
    default: 0,
    min: 0
  },
  teardownTime: {
    type: Number, // in minutes
    default: 0,
    min: 0
  },
  description: {
    type: String,
    maxlength: 500
  },
  skillRequired: {
    type: String
  },
  qualityCheckRequired: {
    type: Boolean,
    default: false
  },
  toolsRequired: [{
    type: String
  }],
  safetyInstructions: {
    type: String,
    maxlength: 500
  }
});

const billOfMaterialsSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    uppercase: true,
    sparse: true
  },
  finishedProduct: {
    type: String,
    required: [true, 'Finished product is required'],
    trim: true
  },
  finishedProductMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  },
  version: {
    type: String,
    required: [true, 'Version is required'],
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Archived'],
    default: 'Draft'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  components: [componentSchema],
  operations: [operationSchema],
  totalQuantity: {
    type: Number,
    default: 1,
    min: 1
  },
  unit: {
    type: String,
    default: 'pcs',
    enum: ['pcs', 'kg', 'm', 'l', 'm2', 'm3', 'box', 'pack', 'set']
  },
  category: {
    type: String,
    trim: true
  },
  estimatedCycleTime: {
    type: Number, // in minutes, calculated from operations
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes (reference index is automatic due to unique: true)
billOfMaterialsSchema.index({ finishedProduct: 1 });
billOfMaterialsSchema.index({ status: 1 });
billOfMaterialsSchema.index({ createdAt: -1 });

// Auto-generate reference
billOfMaterialsSchema.pre('save', async function(next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.reference = `BOM-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Calculate estimated cycle time from operations
  if (this.operations && this.operations.length > 0) {
    this.estimatedCycleTime = this.operations.reduce((total, op) => {
      return total + (op.duration || 0) + (op.setupTime || 0) + (op.teardownTime || 0);
    }, 0);
  }

  next();
});

// Virtual for total material cost
billOfMaterialsSchema.virtual('totalMaterialCost').get(function() {
  if (!this.components || this.components.length === 0) return 0;
  return this.components.reduce((total, component) => {
    return total + (component.quantity * component.unitCost);
  }, 0);
});

// Virtual for total operation time
billOfMaterialsSchema.virtual('totalOperationTime').get(function() {
  if (!this.operations || this.operations.length === 0) return 0;
  return this.operations.reduce((total, operation) => {
    return total + operation.duration + operation.setupTime;
  }, 0);
});

// Virtual for total cost (materials + operations)
billOfMaterialsSchema.virtual('totalCost').get(function() {
  const materialCost = this.totalMaterialCost;
  // Operation cost calculation would need work center rates
  return materialCost;
});

billOfMaterialsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('BillOfMaterials', billOfMaterialsSchema);

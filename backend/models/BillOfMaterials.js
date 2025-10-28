const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.001
  },
  unit: {
    type: String,
    required: true
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
  notes: {
    type: String,
    maxlength: 200
  }
});

const operationSchema = new mongoose.Schema({
  sequence: {
    type: Number,
    required: true,
    min: 1
  },
  name: {
    type: String,
    required: true
  },
  workCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter',
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  setupTime: {
    type: Number, // in minutes
    default: 0
  },
  description: {
    type: String,
    maxlength: 500
  },
  skillRequired: {
    type: String
  }
});

const billOfMaterialsSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    uppercase: true,
    required: false,
    default: function() {
      return `BOM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    }
  },
  finishedProduct: {
    type: String,
    required: [true, 'Finished product is required']
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
    default: 'pcs'
  },
  category: {
    type: String
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
    this.reference = `BOM-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Virtual for total material cost
billOfMaterialsSchema.virtual('totalMaterialCost').get(function() {
  return this.components.reduce((total, component) => {
    return total + (component.quantity * component.unitCost);
  }, 0);
});

// Virtual for total operation time
billOfMaterialsSchema.virtual('totalOperationTime').get(function() {
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

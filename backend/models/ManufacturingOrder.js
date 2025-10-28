const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantityRequired: {
    type: Number,
    required: true,
    min: 0.001
  },
  quantityReserved: {
    type: Number,
    default: 0,
    min: 0
  },
  quantityConsumed: {
    type: Number,
    default: 0,
    min: 0
  },
  quantityScrapped: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  unitCost: {
    type: Number,
    default: 0
  },
  wastePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isReserved: {
    type: Boolean,
    default: false
  },
  reservedAt: {
    type: Date
  }
});

const manufacturingOrderSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    uppercase: true,
    sparse: true
  },
  finishedProduct: {
    type: String,
    required: [true, 'Finished product is required']
  },
  finishedProductMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  quantityProduced: {
    type: Number,
    default: 0,
    min: 0
  },
  quantityScrap: {
    type: Number,
    default: 0,
    min: 0
  },
  scheduledStartDate: {
    type: Date,
    required: [true, 'Scheduled start date is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assignee is required']
  },
  status: {
    type: String,
    enum: ['Draft', 'Confirmed', 'In Progress', 'To Close', 'Done', 'Cancelled'],
    default: 'Draft'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  bomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillOfMaterials'
  },
  components: [componentSchema],
  workOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder'
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  isDelayed: {
    type: Boolean,
    default: false
  },
  delayReason: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance (reference index is automatic due to unique: true)
manufacturingOrderSchema.index({ status: 1 });
manufacturingOrderSchema.index({ assignee: 1 });
manufacturingOrderSchema.index({ dueDate: 1 });
manufacturingOrderSchema.index({ createdAt: -1 });

// Auto-generate reference if not provided
manufacturingOrderSchema.pre('save', async function(next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.reference = `MO-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Check if order is delayed
  if (this.status !== 'Done' && this.status !== 'Cancelled' && this.dueDate < new Date()) {
    this.isDelayed = true;
  }

  next();
});

// Virtual for duration
manufacturingOrderSchema.virtual('duration').get(function() {
  if (this.actualStartDate && this.actualEndDate) {
    return Math.ceil((this.actualEndDate - this.actualStartDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for total cost
manufacturingOrderSchema.virtual('totalCost').get(function() {
  return this.components.reduce((total, component) => {
    return total + (component.quantityRequired * component.unitCost);
  }, 0);
});

// Virtual for actual cost (including waste and scrap)
manufacturingOrderSchema.virtual('actualCost').get(function() {
  return this.components.reduce((total, component) => {
    return total + ((component.quantityConsumed + component.quantityScrapped) * component.unitCost);
  }, 0);
});

// Virtual for completion percentage
manufacturingOrderSchema.virtual('completionRate').get(function() {
  if (this.quantity === 0) return 0;
  return Math.round((this.quantityProduced / this.quantity) * 100);
});

// Virtual for efficiency
manufacturingOrderSchema.virtual('efficiency').get(function() {
  if (!this.actualStartDate || !this.actualEndDate) return null;
  // Could be enhanced with estimated vs actual time comparison
  return this.progress;
});

manufacturingOrderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ManufacturingOrder', manufacturingOrderSchema);

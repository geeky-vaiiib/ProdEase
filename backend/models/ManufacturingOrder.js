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
  }
});

const manufacturingOrderSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    uppercase: true
  },
  finishedProduct: {
    type: String,
    required: [true, 'Finished product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
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
    this.reference = `MO-${year}-${String(count + 1).padStart(3, '0')}`;
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
    return total + (component.quantity * component.unitCost);
  }, 0);
});

manufacturingOrderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ManufacturingOrder', manufacturingOrderSchema);

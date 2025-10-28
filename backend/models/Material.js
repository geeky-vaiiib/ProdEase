const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Material code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Raw Material', 'Component', 'Finished Good', 'Consumable', 'Tool']
  },
  subcategory: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pcs', 'kg', 'm', 'l', 'm2', 'm3', 'box', 'pack', 'set']
  },
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    color: String,
    grade: String,
    standard: String
  },
  suppliers: [{
    name: {
      type: String,
      required: true
    },
    code: String,
    leadTime: {
      type: Number,
      default: 7 // days
    },
    minOrderQuantity: {
      type: Number,
      default: 1
    },
    unitCost: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    contact: {
      email: String,
      phone: String
    }
  }],
  inventory: {
    currentStock: {
      type: Number,
      default: 0,
      min: 0
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0
    },
    availableStock: {
      type: Number,
      default: 0,
      min: 0
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: 0
    },
    maxStock: {
      type: Number,
      default: 1000
    },
    averageCost: {
      type: Number,
      default: 0
    },
    lastCost: {
      type: Number,
      default: 0
    }
  },
  location: {
    warehouse: {
      type: String,
      default: 'Main Warehouse'
    },
    zone: String,
    bin: String,
    shelf: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Discontinued', 'Obsolete'],
    default: 'Active'
  },
  quality: {
    requiresInspection: {
      type: Boolean,
      default: false
    },
    shelfLife: Number, // in days
    expiryDate: Date,
    batchTracking: {
      type: Boolean,
      default: false
    }
  },
  cost: {
    standardCost: {
      type: Number,
      default: 0
    },
    lastPurchaseCost: {
      type: Number,
      default: 0
    },
    movingAverageCost: {
      type: Number,
      default: 0
    }
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

// Indexes
materialSchema.index({ code: 1 }); // Already unique
materialSchema.index({ name: 1 });
materialSchema.index({ category: 1 });
materialSchema.index({ status: 1 });
materialSchema.index({ 'inventory.currentStock': 1 });

// Virtual for available stock
materialSchema.virtual('availableStock').get(function() {
  return Math.max(0, this.inventory.currentStock - this.inventory.reservedStock);
});

// Virtual for stock status
materialSchema.virtual('stockStatus').get(function() {
  const current = this.inventory.currentStock;
  const reorder = this.inventory.reorderLevel;

  if (current <= 0) return 'Out of Stock';
  if (current <= reorder) return 'Low Stock';
  if (current >= this.inventory.maxStock) return 'Overstock';
  return 'In Stock';
});

// Virtual for total value
materialSchema.virtual('totalValue').get(function() {
  return this.inventory.currentStock * this.inventory.averageCost;
});

// Auto-generate material code if not provided
materialSchema.pre('save', async function(next) {
  if (!this.code) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.code = `MAT-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Update available stock
  this.inventory.availableStock = this.availableStock;

  next();
});

// Method to update stock
materialSchema.methods.updateStock = function(quantity, type = 'ADJUSTMENT', reference = '', performedBy) {
  const transaction = {
    type,
    quantity,
    unitCost: this.inventory.lastCost,
    reference,
    referenceType: type === 'IN' ? 'Purchase Order' :
                   type === 'OUT' ? 'Manufacturing Order' : 'Adjustment',
    performedBy,
    timestamp: new Date()
  };

  // Update stock based on type
  if (type === 'IN') {
    this.inventory.currentStock += quantity;
    // Update average cost using weighted average
    const totalValue = (this.inventory.currentStock - quantity) * this.inventory.averageCost +
                      quantity * this.inventory.lastCost;
    this.inventory.averageCost = totalValue / this.inventory.currentStock;
  } else if (type === 'OUT') {
    this.inventory.currentStock = Math.max(0, this.inventory.currentStock - quantity);
  } else if (type === 'RESERVE') {
    this.inventory.reservedStock += quantity;
  } else if (type === 'UNRESERVE') {
    this.inventory.reservedStock = Math.max(0, this.inventory.reservedStock - quantity);
  }

  // Update available stock
  this.inventory.availableStock = this.availableStock;

  return transaction;
};

materialSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Material', materialSchema);

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['IN', 'OUT', 'ADJUSTMENT'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    default: 0
  },
  reference: {
    type: String, // MO reference, PO reference, etc.
    required: true
  },
  referenceType: {
    type: String,
    enum: ['Manufacturing Order', 'Purchase Order', 'Adjustment', 'Return', 'Transfer'],
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const stockLedgerSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  },
  materialName: {
    type: String,
    required: [true, 'Material name is required']
  },
  materialCode: {
    type: String,
    required: [true, 'Material code is required'],
    uppercase: true
  },
  category: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required']
  },
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
  },
  location: {
    warehouse: {
      type: String,
      default: 'Main Warehouse'
    },
    zone: {
      type: String
    },
    bin: {
      type: String
    }
  },
  supplier: {
    name: {
      type: String
    },
    contact: {
      type: String
    },
    leadTime: {
      type: Number, // in days
      default: 7
    }
  },
  transactions: [transactionSchema],
  lastMovement: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
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

// Indexes (materialCode index is automatic due to unique: true)
stockLedgerSchema.index({ materialName: 1 });
stockLedgerSchema.index({ category: 1 });
stockLedgerSchema.index({ currentStock: 1 });
stockLedgerSchema.index({ 'transactions.timestamp': -1 });

// Update available stock before saving
stockLedgerSchema.pre('save', function(next) {
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  next();
});

// Virtual for stock status
stockLedgerSchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'Out of Stock';
  if (this.currentStock <= this.reorderLevel) return 'Low Stock';
  if (this.currentStock >= this.maxStock) return 'Overstock';
  return 'In Stock';
});

// Virtual for stock value
stockLedgerSchema.virtual('stockValue').get(function() {
  return this.currentStock * this.averageCost;
});

// Method to add transaction
stockLedgerSchema.methods.addTransaction = function(transactionData) {
  this.transactions.push(transactionData);
  
  // Update stock based on transaction type
  if (transactionData.type === 'IN') {
    this.currentStock += transactionData.quantity;
    // Update average cost using weighted average
    const totalValue = (this.currentStock - transactionData.quantity) * this.averageCost + 
                      transactionData.quantity * transactionData.unitCost;
    this.averageCost = totalValue / this.currentStock;
    this.lastCost = transactionData.unitCost;
  } else if (transactionData.type === 'OUT') {
    this.currentStock = Math.max(0, this.currentStock - transactionData.quantity);
  } else if (transactionData.type === 'ADJUSTMENT') {
    this.currentStock = Math.max(0, transactionData.quantity);
  }
  
  this.lastMovement = new Date();
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
};

stockLedgerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);

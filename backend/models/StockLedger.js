const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['IN', 'OUT', 'ADJUSTMENT', 'RESERVE', 'UNRESERVE'],
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
    ref: 'Material',
    required: true
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

// Indexes
stockLedgerSchema.index({ materialId: 1 });
stockLedgerSchema.index({ materialName: 1 });
stockLedgerSchema.index({ materialCode: 1 });
stockLedgerSchema.index({ 'transactions.timestamp': -1 });

// Method to add transaction (just logs the transaction)
stockLedgerSchema.methods.addTransaction = function(transactionData) {
  this.transactions.push(transactionData);
  this.lastMovement = new Date();
};

stockLedgerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);

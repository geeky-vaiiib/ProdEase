const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const workOrderSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: [true, 'Reference is required'],
    unique: true,
    uppercase: true
  },
  manufacturingOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ManufacturingOrder',
    required: [true, 'Manufacturing Order ID is required']
  },
  operationName: {
    type: String,
    required: [true, 'Operation name is required']
  },
  workCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter',
    required: [true, 'Work center is required']
  },
  sequence: {
    type: Number,
    required: true,
    min: 1
  },
  expectedDuration: {
    type: Number, // in minutes
    required: [true, 'Expected duration is required'],
    min: 1
  },
  realDuration: {
    type: Number, // in minutes
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Paused', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assignee is required']
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  pausedTime: {
    type: Number, // total paused time in minutes
    default: 0
  },
  qualityCheck: {
    passed: {
      type: Boolean,
      default: null
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedAt: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: 500
    }
  },
  comments: [commentSchema],
  materials: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    name: String,
    quantityUsed: {
      type: Number,
      min: 0
    },
    unit: String
  }],
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

// Indexes (reference index is automatic due to unique: true)
workOrderSchema.index({ manufacturingOrderId: 1 });
workOrderSchema.index({ status: 1 });
workOrderSchema.index({ assignee: 1 });
workOrderSchema.index({ workCenter: 1 });

// Auto-generate reference
workOrderSchema.pre('save', async function(next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.reference = `WO-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Virtual for efficiency percentage
workOrderSchema.virtual('efficiency').get(function() {
  if (this.realDuration > 0 && this.expectedDuration > 0) {
    return Math.round((this.expectedDuration / this.realDuration) * 100);
  }
  return null;
});

// Virtual for actual duration (excluding paused time)
workOrderSchema.virtual('actualDuration').get(function() {
  if (this.startTime && this.endTime) {
    const totalTime = Math.ceil((this.endTime - this.startTime) / (1000 * 60));
    return Math.max(0, totalTime - this.pausedTime);
  }
  return null;
});

workOrderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('WorkOrder', workOrderSchema);

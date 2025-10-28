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
    uppercase: true,
    sparse: true
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
  status: {
    type: String,
    enum: ['Pending', 'Ready', 'In Progress', 'Paused', 'Completed', 'Cancelled', 'Failed'],
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
  pauseHistory: [{
    pausedAt: Date,
    resumedAt: Date,
    reason: String,
    duration: Number // in minutes
  }],
  qualityCheck: {
    required: {
      type: Boolean,
      default: false
    },
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
    },
    defectsFound: [{
      type: String,
      description: String,
      severity: {
        type: String,
        enum: ['Minor', 'Major', 'Critical']
      }
    }]
  },
  comments: [commentSchema],
  materials: [{
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
    }
  }],
  tools: [{
    name: String,
    code: String
  }],
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  safetyCheckCompleted: {
    type: Boolean,
    default: false
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
    this.reference = `WO-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Calculate real duration if start and end times are set
  if (this.startTime && this.endTime && !this.realDuration) {
    const totalMinutes = Math.ceil((this.endTime - this.startTime) / (1000 * 60));
    this.realDuration = Math.max(0, totalMinutes - this.pausedTime);
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

// Virtual for cost
workOrderSchema.virtual('cost').get(function() {
  return this.materials.reduce((total, material) => {
    return total + ((material.quantityConsumed + material.quantityScrapped) * material.unitCost);
  }, 0);
});

// Virtual for on-time status
workOrderSchema.virtual('isOnTime').get(function() {
  if (!this.expectedDuration || !this.realDuration) return null;
  return this.realDuration <= this.expectedDuration;
});

workOrderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('WorkOrder', workOrderSchema);

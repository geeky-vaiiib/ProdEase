const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Preventive', 'Corrective', 'Emergency'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  cost: {
    type: Number,
    default: 0
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
});

const workCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Work center name is required'],
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Work center code is required'],
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['Machine', 'Assembly', 'Quality', 'Packaging', 'Storage'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  costPerHour: {
    type: Number,
    required: [true, 'Cost per hour is required'],
    min: 0
  },
  capacity: {
    hoursPerDay: {
      type: Number,
      default: 8,
      min: 1,
      max: 24
    },
    daysPerWeek: {
      type: Number,
      default: 5,
      min: 1,
      max: 7
    },
    efficiency: {
      type: Number,
      default: 85,
      min: 0,
      max: 100
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Inactive', 'Broken'],
    default: 'Active'
  },
  downtime: {
    totalMinutes: {
      type: Number,
      default: 0
    },
    lastDowntime: {
      type: Date
    },
    reason: {
      type: String
    }
  },
  specifications: {
    manufacturer: String,
    model: String,
    serialNumber: String,
    installationDate: Date,
    warrantyExpiry: Date
  },
  maintenance: [maintenanceSchema],
  operators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes (code and name indexes are automatic due to unique: true)
workCenterSchema.index({ status: 1 });
workCenterSchema.index({ type: 1 });

// Virtual for availability percentage
workCenterSchema.virtual('availability').get(function() {
  const totalMinutesInMonth = 30 * this.capacity.hoursPerDay * 60;
  const availableMinutes = totalMinutesInMonth - this.downtime.totalMinutes;
  return Math.round((availableMinutes / totalMinutesInMonth) * 100);
});

// Virtual for effective capacity
workCenterSchema.virtual('effectiveCapacity').get(function() {
  const baseCapacity = this.capacity.hoursPerDay * this.capacity.daysPerWeek;
  return Math.round(baseCapacity * (this.capacity.efficiency / 100));
});

workCenterSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('WorkCenter', workCenterSchema);

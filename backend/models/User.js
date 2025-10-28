const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'supervisor', 'operator', 'inventory', 'quality'],
    default: 'operator'
  },
  permissions: {
    canCreateMO: {
      type: Boolean,
      default: false
    },
    canApproveMO: {
      type: Boolean,
      default: false
    },
    canStartWO: {
      type: Boolean,
      default: false
    },
    canCompleteWO: {
      type: Boolean,
      default: false
    },
    canManageMaterials: {
      type: Boolean,
      default: false
    },
    canManageBOM: {
      type: Boolean,
      default: false
    },
    canViewReports: {
      type: Boolean,
      default: false
    },
    canManageUsers: {
      type: Boolean,
      default: false
    }
  },
  avatarUrl: {
    type: String,
    default: null
  },
  otpCode: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  }
}, {
  timestamps: true
});

// Indexes are automatically created by unique: true in field definitions

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpCode = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(otp) {
  return this.otpCode === otp && this.otpExpiry > new Date();
};

// Clear OTP
userSchema.methods.clearOTP = function() {
  this.otpCode = null;
  this.otpExpiry = null;
};

// Set permissions based on role
userSchema.methods.setPermissionsByRole = function() {
  const rolePermissions = {
    admin: {
      canCreateMO: true,
      canApproveMO: true,
      canStartWO: true,
      canCompleteWO: true,
      canManageMaterials: true,
      canManageBOM: true,
      canViewReports: true,
      canManageUsers: true
    },
    manager: {
      canCreateMO: true,
      canApproveMO: true,
      canStartWO: true,
      canCompleteWO: true,
      canManageMaterials: true,
      canManageBOM: true,
      canViewReports: true,
      canManageUsers: false
    },
    supervisor: {
      canCreateMO: true,
      canApproveMO: false,
      canStartWO: true,
      canCompleteWO: true,
      canManageMaterials: false,
      canManageBOM: false,
      canViewReports: true,
      canManageUsers: false
    },
    operator: {
      canCreateMO: false,
      canApproveMO: false,
      canStartWO: true,
      canCompleteWO: true,
      canManageMaterials: false,
      canManageBOM: false,
      canViewReports: false,
      canManageUsers: false
    },
    inventory: {
      canCreateMO: false,
      canApproveMO: false,
      canStartWO: false,
      canCompleteWO: false,
      canManageMaterials: true,
      canManageBOM: false,
      canViewReports: true,
      canManageUsers: false
    },
    quality: {
      canCreateMO: false,
      canApproveMO: false,
      canStartWO: false,
      canCompleteWO: false,
      canManageMaterials: false,
      canManageBOM: false,
      canViewReports: true,
      canManageUsers: false
    }
  };

  if (rolePermissions[this.role]) {
    this.permissions = { ...this.permissions, ...rolePermissions[this.role] };
  }
};

// Transform output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.otpCode;
  delete user.otpExpiry;
  return user;
};

module.exports = mongoose.model('User', userSchema);

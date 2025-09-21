const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    next();
  };
};

// Auth validation schemas
const authSchemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('manager', 'operator', 'inventory', 'admin').default('operator')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  verifyOTP: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required()
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).required()
  })
};

// Manufacturing Order validation schemas
const manufacturingOrderSchemas = {
  create: Joi.object({
    finishedProduct: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    scheduledStartDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    assignee: Joi.string().required(),
    bomId: Joi.string().optional(),
    components: Joi.array().items(Joi.object({
      materialId: Joi.string().optional(),
      name: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().required(),
      unitCost: Joi.number().min(0).default(0)
    })).default([]),
    status: Joi.string().valid('Draft', 'Confirmed', 'In Progress', 'To Close', 'Done', 'Cancelled').default('Draft'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').default('Medium'),
    notes: Joi.string().max(1000).optional()
  }),

  update: Joi.object({
    finishedProduct: Joi.string().optional(),
    quantity: Joi.number().min(1).optional(),
    scheduledStartDate: Joi.date().optional(),
    dueDate: Joi.date().optional(),
    assignee: Joi.string().optional(),
    status: Joi.string().valid('Draft', 'Confirmed', 'In Progress', 'To Close', 'Done', 'Cancelled').optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').optional(),
    progress: Joi.number().min(0).max(100).optional(),
    actualStartDate: Joi.date().optional(),
    actualEndDate: Joi.date().optional(),
    notes: Joi.string().max(1000).optional()
  })
};

// Work Order validation schemas
const workOrderSchemas = {
  create: Joi.object({
    manufacturingOrderId: Joi.string().required(),
    operationName: Joi.string().required(),
    workCenter: Joi.string().required(),
    sequence: Joi.number().min(1).required(),
    expectedDuration: Joi.number().min(1).required(),
    assignee: Joi.string().required()
  }),

  update: Joi.object({
    operationName: Joi.string().optional(),
    workCenter: Joi.string().optional(),
    sequence: Joi.number().min(1).optional(),
    expectedDuration: Joi.number().min(1).optional(),
    realDuration: Joi.number().min(0).optional(),
    status: Joi.string().valid('Pending', 'In Progress', 'Paused', 'Completed', 'Cancelled').optional(),
    assignee: Joi.string().optional(),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
    pausedTime: Joi.number().min(0).optional()
  }),

  addComment: Joi.object({
    text: Joi.string().max(500).required()
  })
};

// BOM validation schemas
const bomSchemas = {
  create: Joi.object({
    finishedProduct: Joi.string().required(),
    version: Joi.string().default('1.0'),
    description: Joi.string().max(1000).optional(),
    components: Joi.array().items(Joi.object({
      materialId: Joi.string().optional(),
      name: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().required(),
      unitCost: Joi.number().min(0).default(0),
      supplier: Joi.string().optional(),
      leadTime: Joi.number().min(0).default(0)
    })).default([]),
    operations: Joi.array().items(Joi.object({
      sequence: Joi.number().min(1).required(),
      name: Joi.string().required(),
      workCenter: Joi.string().required(),
      duration: Joi.number().min(1).required(),
      setupTime: Joi.number().min(0).default(0),
      description: Joi.string().max(500).optional(),
      skillRequired: Joi.string().optional()
    })).default([]),
    totalQuantity: Joi.number().min(1).default(1),
    unit: Joi.string().default('pcs'),
    category: Joi.string().optional()
  })
};

// Work Center validation schemas
const workCenterSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    description: Joi.string().max(500).optional(),
    type: Joi.string().valid('Machine', 'Assembly', 'Quality', 'Packaging', 'Storage').required(),
    location: Joi.string().required(),
    costPerHour: Joi.number().min(0).required(),
    capacity: Joi.object({
      hoursPerDay: Joi.number().min(1).max(24).default(8),
      daysPerWeek: Joi.number().min(1).max(7).default(5),
      efficiency: Joi.number().min(0).max(100).default(85)
    }).default({}),
    specifications: Joi.object({
      manufacturer: Joi.string().optional(),
      model: Joi.string().optional(),
      serialNumber: Joi.string().optional(),
      installationDate: Joi.date().optional(),
      warrantyExpiry: Joi.date().optional()
    }).optional()
  })
};

module.exports = {
  validate,
  authSchemas,
  manufacturingOrderSchemas,
  workOrderSchemas,
  bomSchemas,
  workCenterSchemas
};

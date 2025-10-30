require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const manufacturingOrderRoutes = require('./routes/manufacturingOrders');
const workOrderRoutes = require('./routes/workOrders');
const bomRoutes = require('./routes/billOfMaterials');
const workCenterRoutes = require('./routes/workCenters');
const stockLedgerRoutes = require('./routes/stockLedger');
const userRoutes = require('./routes/users');
const materialsRoutes = require('./routes/materials');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration - Allow all origins in development
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    cors: 'enabled'
  });
});

// Public system metrics endpoint for landing page
app.get('/api/metrics', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      systemHealth: Math.floor(Math.random() * 5) + 95, // 95-100%
      activeConnections: Math.floor(Math.random() * 50) + 150,
      totalRequests: Math.floor(Math.random() * 1000) + 50000,
      responseTime: Math.floor(Math.random() * 50) + 25, // 25-75ms
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '2.1.0',
      features: {
        manufacturing: true,
        realTime: true,
        analytics: true,
        automation: true
      },
      stats: {
        totalOrders: Math.floor(Math.random() * 100) + 200,
        activeProduction: Math.floor(Math.random() * 20) + 80,
        qualityScore: Math.floor(Math.random() * 5) + 95,
        efficiency: Math.floor(Math.random() * 10) + 85
      }
    }
  });
});

// Setup endpoint to create initial test data
app.get('/api/setup', async (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ProdEase Setup</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a1a; color: white; }
        .container { max-width: 600px; margin: 0 auto; }
        button { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #2563eb; }
        .result { margin-top: 20px; padding: 10px; background: #2a2a2a; border-radius: 5px; }
        .success { color: #10b981; }
        .error { color: #ef4444; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 ProdEase Setup</h1>
        <p>Click the button below to create test data for the ProdEase system.</p>
        <button onclick="setupData()">Create Test Data</button>
        <div id="result" class="result" style="display: none;"></div>
      </div>

      <script>
        async function setupData() {
          const resultDiv = document.getElementById('result');
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = '⏳ Creating test data...';
          
          try {
            const response = await fetch('/api/setup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.success) {
              resultDiv.className = 'result success';
              resultDiv.innerHTML = \`
                <h3>✅ Success!</h3>
                <p>\${data.message}</p>
                <p><strong>Test Credentials:</strong></p>
                <ul>
                  <li>Admin: admin@prodease.com / Admin@123</li>
                  <li>Operator: operator@prodease.com / Test@123</li>
                </ul>
                <p><a href="http://localhost:3000" style="color: #3b82f6;">Go to ProdEase App</a></p>
              \`;
            } else {
              resultDiv.className = 'result error';
              resultDiv.innerHTML = \`<h3>❌ Error</h3><p>\${data.message}</p>\`;
            }
          } catch (error) {
            resultDiv.className = 'result error';
            resultDiv.innerHTML = \`<h3>❌ Error</h3><p>Failed to setup data: \${error.message}</p>\`;
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/api/setup', async (req, res) => {
  try {
    const User = require('./models/User');
    const ManufacturingOrder = require('./models/ManufacturingOrder');
    const WorkCenter = require('./models/WorkCenter');
    
    // Create admin user if doesn't exist
    let adminUser = await User.findOne({ email: 'admin@prodease.com' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@prodease.com',
        passwordHash: 'Admin@123',
        role: 'admin'
      });
    }

    // Create test user if doesn't exist
    let testUser = await User.findOne({ email: 'operator@prodease.com' });
    if (!testUser) {
      testUser = await User.create({
        username: 'operator',
        email: 'operator@prodease.com',
        passwordHash: 'Test@123',
        role: 'operator'
      });
    }

    // Create sample work centers
    const workCenterExists = await WorkCenter.findOne({});
    if (!workCenterExists) {
      await WorkCenter.create([
        {
          name: 'Assembly Line A',
          code: 'AL-001',
          description: 'Main assembly line for product manufacturing',
          type: 'Assembly',
          location: 'Building 1, Floor 2',
          costPerHour: 50.00,
          capacity: {
            hoursPerDay: 8,
            daysPerWeek: 5,
            efficiency: 85
          },
          status: 'Active',
          availability: 95,
          effectiveCapacity: 32,
          operators: [testUser._id]
        },
        {
          name: 'Quality Control Station',
          code: 'QC-001',
          description: 'Quality inspection and testing station',
          type: 'Quality',
          location: 'Building 1, Floor 1',
          costPerHour: 35.00,
          capacity: {
            hoursPerDay: 8,
            daysPerWeek: 5,
            efficiency: 90
          },
          status: 'Active',
          availability: 88,
          effectiveCapacity: 28.8,
          operators: [testUser._id]
        }
      ]);
    }

    // Create sample manufacturing orders
    const orderExists = await ManufacturingOrder.findOne({});
    if (!orderExists) {
      await ManufacturingOrder.create([
        {
          reference: 'MO-2025-001',
          finishedProduct: 'Industrial Widget A',
          quantity: 100,
          scheduledStartDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          assignee: testUser._id,
          status: 'In Progress',
          priority: 'High',
          progress: 45,
          components: [
            {
              name: 'Steel Frame',
              quantity: 100,
              unit: 'pcs',
              unitCost: 15.50
            },
            {
              name: 'Motor Assembly',
              quantity: 100,
              unit: 'pcs',
              unitCost: 85.00
            }
          ],
          workOrders: [],
          createdBy: adminUser._id
        },
        {
          reference: 'MO-2025-002',
          finishedProduct: 'Industrial Widget B',
          quantity: 50,
          scheduledStartDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          assignee: testUser._id,
          status: 'Confirmed',
          priority: 'Medium',
          progress: 0,
          components: [
            {
              name: 'Aluminum Frame',
              quantity: 50,
              unit: 'pcs',
              unitCost: 22.00
            }
          ],
          workOrders: [],
          createdBy: adminUser._id
        },
        {
          reference: 'MO-2025-003',
          finishedProduct: 'Control Panel X1',
          quantity: 25,
          scheduledStartDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          assignee: testUser._id,
          status: 'Done',
          priority: 'Low',
          progress: 100,
          actualStartDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          actualEndDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          components: [
            {
              name: 'Control Board',
              quantity: 25,
              unit: 'pcs',
              unitCost: 125.00
            }
          ],
          workOrders: [],
          createdBy: adminUser._id
        }
      ]);
    }

    res.status(200).json({
      success: true,
      message: 'Test data created successfully',
      data: {
        users: { admin: adminUser._id, operator: testUser._id },
        message: 'Login with admin@prodease.com / Admin@123 or operator@prodease.com / Test@123'
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test data',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/manufacturing-orders', manufacturingOrderRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/bom', bomRoutes);
app.use('/api/work-centers', workCenterRoutes);
app.use('/api/stock-ledger', stockLedgerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/theme', require('./routes/theme'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1);
});

module.exports = app;

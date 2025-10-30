/**
 * ProdEase System Validation Script
 * This script tests the complete manufacturing flow
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5003/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let authToken = null;
let testData = {
  userId: null,
  materialIds: [],
  workCenterIds: [],
  bomId: null,
  moId: null,
  workOrderIds: []
};

// Helper functions
const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

// Add auth token to requests
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Test functions
async function testServerConnection() {
  log.section('1. Testing Server Connection');
  try {
    // Try to hit the auth/login endpoint (it will fail but proves server is up)
    await axios.post(`${BASE_URL}/auth/login`, { email: '', password: '' });
    log.success('Server is responding');
    return true;
  } catch (error) {
    // Any 4xx response means server is working (just bad request)
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      log.success('Server is running and responding');
      return true;
    }
    log.error(`Server connection failed: ${error.message}`);
    return false;
  }
}

async function testAuthentication() {
  log.section('2. Testing Authentication');
  
  const testUser = {
    username: `test${Date.now().toString().slice(-6)}`,
    email: `test_${Date.now()}@prodease.com`,
    password: 'Test123456!',
    role: 'admin'
  };

  try {
    // Register
    log.info('Registering new user...');
    const registerRes = await api.post('/auth/register', testUser);
    testData.userId = registerRes.data.data?._id || registerRes.data.user?._id;
    authToken = registerRes.data.token;
    log.success(`User registered: ${testUser.username}`);

    // If no token from registration, try login
    if (!authToken) {
      log.info('Logging in...');
      const loginRes = await api.post('/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      authToken = loginRes.data.token;
    }
    
    log.success('Login successful, token received');

    // Get current user
    log.info('Fetching user profile...');
    const meRes = await api.get('/auth/me');
    if (!testData.userId) {
      testData.userId = meRes.data.data?._id || meRes.data.user?._id;
    }
    log.success(`Profile retrieved: ${meRes.data.data?.username || meRes.data.user?.username}`);

    return true;
  } catch (error) {
    log.error(`Authentication failed: ${error.response?.data?.message || error.message}`);
    console.log('Response data:', error.response?.data);
    return false;
  }
}

async function testMaterialCreation() {
  log.section('3. Testing Material Management');

  const materials = [
    {
      name: 'Steel Sheet',
      code: 'MAT-STEEL-001',
      category: 'Raw Material',
      unit: 'kg',
      inventory: {
        currentStock: 1000,
        reorderLevel: 100,
        averageCost: 5.50,
        lastCost: 5.75
      }
    },
    {
      name: 'Aluminum Plate',
      code: 'MAT-ALU-001',
      category: 'Raw Material',
      unit: 'kg',
      inventory: {
        currentStock: 500,
        reorderLevel: 50,
        averageCost: 8.25,
        lastCost: 8.50
      }
    },
    {
      name: 'Finished Widget',
      code: 'MAT-FIN-001',
      category: 'Finished Good',
      unit: 'pcs',
      inventory: {
        currentStock: 0,
        reorderLevel: 10,
        averageCost: 0,
        lastCost: 0
      }
    }
  ];

  try {
    for (const material of materials) {
      const response = await api.post('/materials', material);
      testData.materialIds.push(response.data.data._id);
      log.success(`Material created: ${material.name} (${response.data.data._id})`);
    }
    return true;
  } catch (error) {
    log.error(`Material creation failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testWorkCenterCreation() {
  log.section('4. Testing Work Center Management');

  const workCenters = [
    {
      name: 'Assembly Line 1',
      code: 'WC-ASM-001',
      type: 'Assembly',
      location: 'Floor A',
      costPerHour: 50,
      capacity: {
        hoursPerDay: 8,
        daysPerWeek: 5,
        efficiency: 85
      }
    },
    {
      name: 'Quality Control',
      code: 'WC-QC-001',
      type: 'Quality',
      location: 'Floor B',
      costPerHour: 40,
      capacity: {
        hoursPerDay: 8,
        daysPerWeek: 5,
        efficiency: 90
      }
    }
  ];

  try {
    for (const wc of workCenters) {
      const response = await api.post('/work-centers', wc);
      testData.workCenterIds.push(response.data.data._id);
      log.success(`Work Center created: ${wc.name} (${response.data.data._id})`);
    }
    return true;
  } catch (error) {
    log.error(`Work Center creation failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testBOMCreation() {
  log.section('5. Testing Bill of Materials (BOM)');

  const bom = {
    finishedProduct: 'Finished Widget',
    finishedProductMaterialId: testData.materialIds[2], // Finished Widget
    version: '1.0',
    description: 'Test BOM for Widget production',
    components: [
      {
        materialId: testData.materialIds[0], // Steel Sheet
        quantity: 5,
        unit: 'kg',
        unitCost: 5.50,
        wastePercentage: 5,
        isCritical: true
      },
      {
        materialId: testData.materialIds[1], // Aluminum Plate
        quantity: 2,
        unit: 'kg',
        unitCost: 8.25,
        wastePercentage: 3
      }
    ],
    operations: [
      {
        sequence: 1,
        name: 'Assembly',
        workCenter: testData.workCenterIds[0],
        duration: 60,
        setupTime: 15,
        teardownTime: 10,
        qualityCheckRequired: false
      },
      {
        sequence: 2,
        name: 'Quality Inspection',
        workCenter: testData.workCenterIds[1],
        duration: 30,
        setupTime: 5,
        teardownTime: 5,
        qualityCheckRequired: true
      }
    ]
  };

  try {
    const response = await api.post('/bom', bom);
    testData.bomId = response.data.data._id;
    log.success(`BOM created: ${response.data.data.reference}`);

    // Approve BOM
    log.info('Approving BOM...');
    await api.patch(`/bom/${testData.bomId}/approve`);
    log.success('BOM approved and activated');

    return true;
  } catch (error) {
    log.error(`BOM creation failed: ${error.response?.data?.message || error.message}`);
    console.log(error.response?.data);
    return false;
  }
}

async function testManufacturingOrderFlow() {
  log.section('6. Testing Manufacturing Order Flow');

  try {
    // Create MO from BOM
    log.info('Creating Manufacturing Order from BOM...');
    const moData = {
      quantity: 10,
      scheduledStartDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: testData.userId,
      priority: 'High',
      notes: 'Test manufacturing order'
    };

    const moRes = await api.post(`/manufacturing-orders/from-bom/${testData.bomId}`, moData);
    testData.moId = moRes.data.data._id;
    log.success(`Manufacturing Order created: ${moRes.data.data.reference}`);

    // Generate Work Orders
    log.info('Generating Work Orders...');
    const woRes = await api.post(`/manufacturing-orders/${testData.moId}/generate-work-orders`);
    testData.workOrderIds = woRes.data.data.map(wo => wo._id);
    log.success(`${woRes.data.data.length} Work Orders generated`);

    // Reserve Materials
    log.info('Reserving materials...');
    await api.post(`/manufacturing-orders/${testData.moId}/reserve-materials`);
    log.success('Materials reserved successfully');

    return true;
  } catch (error) {
    log.error(`Manufacturing Order flow failed: ${error.response?.data?.message || error.message}`);
    console.log(error.response?.data);
    return false;
  }
}

async function testWorkOrderExecution() {
  log.section('7. Testing Work Order Execution');

  try {
    for (let i = 0; i < testData.workOrderIds.length; i++) {
      const woId = testData.workOrderIds[i];
      
      // Get WO details
      const woDetails = await api.get(`/work-orders/${woId}`);
      log.info(`Processing Work Order: ${woDetails.data.data.reference} (${woDetails.data.data.operationName})`);

      // Start Work Order
      log.info('Starting work order...');
      await api.patch(`/work-orders/${woId}/start`);
      log.success('Work order started');

      // Wait a bit to simulate work
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Complete Work Order
      log.info('Completing work order...');
      const completeData = {
        realDuration: woDetails.data.data.expectedDuration + 5,
        qualityCheck: {
          passed: true,
          notes: 'Quality check passed'
        }
      };
      
      await api.patch(`/work-orders/${woId}/complete`, completeData);
      log.success('Work order completed');

      // Check MO progress
      const moStatus = await api.get(`/manufacturing-orders/${testData.moId}`);
      log.info(`Manufacturing Order progress: ${moStatus.data.data.progress}%`);
    }

    return true;
  } catch (error) {
    log.error(`Work Order execution failed: ${error.response?.data?.message || error.message}`);
    console.log(error.response?.data);
    return false;
  }
}

async function testManufacturingOrderCompletion() {
  log.section('8. Testing Manufacturing Order Completion');

  try {
    log.info('Completing Manufacturing Order...');
    const response = await api.post(`/manufacturing-orders/${testData.moId}/complete`);
    log.success(`Manufacturing Order completed: ${response.data.data.status}`);
    
    // Verify finished goods were added to inventory
    log.info('Verifying inventory update...');
    const material = await api.get(`/materials/${testData.materialIds[2]}`);
    log.success(`Finished goods stock: ${material.data.data.inventory.currentStock} units`);

    return true;
  } catch (error) {
    log.error(`MO completion failed: ${error.response?.data?.message || error.message}`);
    console.log(error.response?.data);
    return false;
  }
}

async function testDashboardAnalytics() {
  log.section('9. Testing Dashboard Analytics');

  try {
    // Overview
    log.info('Testing dashboard overview...');
    const overview = await api.get('/dashboard/overview');
    log.success(`Total MOs: ${overview.data.data.manufacturingOrders.total}`);
    log.success(`Total WOs: ${overview.data.data.workOrders.total}`);
    log.success(`Total Materials: ${overview.data.data.materials.total}`);

    // Performance
    log.info('Testing performance metrics...');
    const performance = await api.get('/dashboard/performance');
    log.success('Performance metrics retrieved');

    // Alerts
    log.info('Testing alerts...');
    const alerts = await api.get('/dashboard/alerts');
    log.success(`Alerts count: ${alerts.data.count}`);

    return true;
  } catch (error) {
    log.error(`Dashboard test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testStockLedger() {
  log.section('10. Testing Stock Ledger');

  try {
    log.info('Fetching stock ledger entries...');
    const ledger = await api.get('/stock-ledger');
    log.success(`Stock ledger entries: ${ledger.data.count || ledger.data.data.length}`);

    // Get ledger for specific material
    if (testData.materialIds.length > 0) {
      const materialLedger = await api.get(`/stock-ledger/material/${testData.materialIds[0]}`);
      log.success(`Transactions for material: ${materialLedger.data.data?.transactions?.length || 0}`);
    }

    return true;
  } catch (error) {
    log.error(`Stock ledger test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n');
  log.section('🔧 ProdEase System Validation');
  log.info('Starting comprehensive system tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Server Connection', fn: testServerConnection },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Material Management', fn: testMaterialCreation },
    { name: 'Work Center Management', fn: testWorkCenterCreation },
    { name: 'BOM Creation', fn: testBOMCreation },
    { name: 'Manufacturing Order Flow', fn: testManufacturingOrderFlow },
    { name: 'Work Order Execution', fn: testWorkOrderExecution },
    { name: 'MO Completion', fn: testManufacturingOrderCompletion },
    { name: 'Dashboard Analytics', fn: testDashboardAnalytics },
    { name: 'Stock Ledger', fn: testStockLedger }
  ];

  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
      log.warning(`Stopping tests due to failure in: ${test.name}`);
      break;
    }
  }

  // Summary
  log.section('Test Summary');
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%\n`);

  if (results.failed === 0) {
    log.success('🎉 All tests passed! System is working correctly.');
  } else {
    log.error('❌ Some tests failed. Please review the errors above.');
  }

  log.section('Test Data IDs (for manual testing)');
  console.log('User ID:', testData.userId);
  console.log('Material IDs:', testData.materialIds);
  console.log('Work Center IDs:', testData.workCenterIds);
  console.log('BOM ID:', testData.bomId);
  console.log('Manufacturing Order ID:', testData.moId);
  console.log('Work Order IDs:', testData.workOrderIds);
  console.log('\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

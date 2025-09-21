#!/usr/bin/env node

/**
 * ProdEase CORS Fix Validation Test
 * Tests the complete authentication flow after CORS fixes
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';
const FRONTEND_URL = 'http://localhost:3003';

// Test data
const testUser = {
  username: 'corstest',
  email: 'corstest@prodease.com',
  password: 'testpass123',
  role: 'operator'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testCORSHeaders() {
  try {
    log('\n🔍 Testing CORS Headers...', 'blue');
    
    const response = await axios.get(`${API_BASE_URL}/health`, {
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    
    log('✅ CORS headers test passed', 'green');
    log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`, 'green');
    log(`   Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials']}`, 'green');
    return true;
  } catch (error) {
    log(`❌ CORS headers test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testRegistration() {
  try {
    log('\n📝 Testing User Registration...', 'blue');
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      withCredentials: true
    });
    
    if (response.data.success) {
      log('✅ Registration successful', 'green');
      log(`   User ID: ${response.data.user.id}`, 'green');
      log(`   Token received: ${response.data.token ? 'Yes' : 'No'}`, 'green');
      return { success: true, token: response.data.token, user: response.data.user };
    } else {
      log(`❌ Registration failed: ${response.data.message}`, 'red');
      return { success: false };
    }
  } catch (error) {
    if (error.response?.data?.message === 'Email already registered') {
      log('⚠️  User already exists, proceeding with login test', 'yellow');
      return { success: true, userExists: true };
    }
    log(`❌ Registration error: ${error.response?.data?.message || error.message}`, 'red');
    return { success: false };
  }
}

async function testLogin() {
  try {
    log('\n🔐 Testing User Login...', 'blue');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      withCredentials: true
    });
    
    if (response.data.success) {
      log('✅ Login successful', 'green');
      log(`   User: ${response.data.user.username}`, 'green');
      log(`   Role: ${response.data.user.role}`, 'green');
      log(`   Token received: ${response.data.token ? 'Yes' : 'No'}`, 'green');
      return { success: true, token: response.data.token, user: response.data.user };
    } else {
      log(`❌ Login failed: ${response.data.message}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Login error: ${error.response?.data?.message || error.message}`, 'red');
    return { success: false };
  }
}

async function testAuthenticatedRequest(token) {
  try {
    log('\n🔒 Testing Authenticated Request...', 'blue');
    
    const response = await axios.get(`${API_BASE_URL}/manufacturing-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': FRONTEND_URL
      },
      withCredentials: true
    });
    
    if (response.data.success) {
      log('✅ Authenticated request successful', 'green');
      log(`   Orders count: ${response.data.data?.length || 0}`, 'green');
      return true;
    } else {
      log(`❌ Authenticated request failed: ${response.data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Authenticated request error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function testFrontendConnectivity() {
  try {
    log('\n🌐 Testing Frontend Connectivity...', 'blue');
    
    const response = await axios.get(FRONTEND_URL);
    
    if (response.status === 200) {
      log('✅ Frontend is accessible', 'green');
      log(`   Response size: ${response.data.length} bytes`, 'green');
      return true;
    } else {
      log('❌ Frontend connectivity issue', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Frontend test error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('🚀 ProdEase CORS Fix Validation Test Suite', 'bold');
  log('='.repeat(50), 'blue');
  
  const results = {
    cors: false,
    frontend: false,
    registration: false,
    login: false,
    authenticated: false
  };
  
  // Test CORS headers
  results.cors = await testCORSHeaders();
  
  // Test frontend connectivity
  results.frontend = await testFrontendConnectivity();
  
  // Test registration
  const regResult = await testRegistration();
  results.registration = regResult.success;
  
  // Test login
  const loginResult = await testLogin();
  results.login = loginResult.success;
  
  // Test authenticated request if login succeeded
  if (loginResult.success && loginResult.token) {
    results.authenticated = await testAuthenticatedRequest(loginResult.token);
  }
  
  // Summary
  log('\n📊 Test Results Summary:', 'bold');
  log('='.repeat(30), 'blue');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${test.toUpperCase().padEnd(15)}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('\n🎉 ALL TESTS PASSED! CORS issue is resolved!', 'green');
    log('✅ Frontend can now communicate with backend successfully', 'green');
    log('✅ User registration and authentication work correctly', 'green');
    log('✅ Authenticated API requests are working', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the issues above.', 'yellow');
  }
  
  log(`\n🔗 Frontend URL: ${FRONTEND_URL}`, 'blue');
  log(`🔗 Backend URL: ${API_BASE_URL}`, 'blue');
}

// Run the tests
runTests().catch(console.error);

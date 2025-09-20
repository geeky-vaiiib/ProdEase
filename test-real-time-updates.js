#!/usr/bin/env node

/**
 * ProdEase Real-Time Updates Test Script
 * Tests the real-time functionality and theme system
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';
const FRONTEND_URL = 'http://localhost:3001';

// Test credentials
const testUser = {
  email: 'test@prodease.com',
  password: 'testpass123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Testing authentication...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    
    if (response.data.success) {
      authToken = response.data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testManufacturingOrdersAPI() {
  try {
    console.log('\n📋 Testing Manufacturing Orders API...');
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test GET all orders
    console.log('  📥 Fetching all orders...');
    const getResponse = await axios.get(`${API_BASE_URL}/manufacturing-orders`, { headers });
    
    if (getResponse.data.success) {
      console.log(`  ✅ Found ${getResponse.data.count} orders`);
      
      if (getResponse.data.count > 0) {
        const firstOrder = getResponse.data.data[0];
        console.log(`  📄 First order: ${firstOrder.reference} - ${firstOrder.finishedProduct}`);
        
        // Test UPDATE order
        console.log('  📝 Testing order update...');
        const updateData = {
          quantity: firstOrder.quantity + 10,
          notes: `Updated at ${new Date().toISOString()}`
        };
        
        const updateResponse = await axios.put(
          `${API_BASE_URL}/manufacturing-orders/${firstOrder._id}`,
          updateData,
          { headers }
        );
        
        if (updateResponse.data.success) {
          console.log('  ✅ Order updated successfully');
          console.log(`  📊 New quantity: ${updateResponse.data.data.quantity}`);
        } else {
          console.log('  ❌ Order update failed');
        }
        
        // Test STATUS update
        console.log('  🔄 Testing status update...');
        const statusResponse = await axios.patch(
          `${API_BASE_URL}/manufacturing-orders/${firstOrder._id}/status`,
          { status: 'In Progress' },
          { headers }
        );
        
        if (statusResponse.data.success) {
          console.log('  ✅ Status updated successfully');
          console.log(`  📊 New status: ${statusResponse.data.data.status}`);
        } else {
          console.log('  ❌ Status update failed');
        }
      }
    } else {
      console.log('  ❌ Failed to fetch orders');
    }
  } catch (error) {
    console.log('  ❌ API test error:', error.response?.data?.message || error.message);
  }
}

async function testThemeAPI() {
  try {
    console.log('\n🎨 Testing Theme API...');
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test GET theme
    console.log('  📥 Getting current theme...');
    const getResponse = await axios.get(`${API_BASE_URL}/theme`, { headers });
    
    if (getResponse.data.success) {
      console.log(`  ✅ Current theme: ${getResponse.data.data.theme}`);
      
      // Test UPDATE theme
      console.log('  🔄 Testing theme update...');
      const newTheme = getResponse.data.data.theme === 'dark' ? 'light' : 'dark';
      
      const updateResponse = await axios.put(
        `${API_BASE_URL}/theme`,
        { theme: newTheme },
        { headers }
      );
      
      if (updateResponse.data.success) {
        console.log(`  ✅ Theme updated to: ${updateResponse.data.data.theme}`);
      } else {
        console.log('  ❌ Theme update failed');
      }
    } else {
      console.log('  ❌ Failed to get theme');
    }
  } catch (error) {
    console.log('  ❌ Theme API test error:', error.response?.data?.message || error.message);
  }
}

async function testFrontendConnectivity() {
  try {
    console.log('\n🌐 Testing Frontend Connectivity...');
    
    const response = await axios.get(FRONTEND_URL);
    
    if (response.status === 200) {
      console.log('  ✅ Frontend is accessible');
      console.log(`  📊 Response size: ${response.data.length} bytes`);
    } else {
      console.log('  ❌ Frontend connectivity issue');
    }
  } catch (error) {
    console.log('  ❌ Frontend test error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting ProdEase Real-Time Updates Test Suite\n');
  console.log('=' .repeat(60));
  
  // Test frontend connectivity
  await testFrontendConnectivity();
  
  // Test authentication
  const loginSuccess = await login();
  
  if (loginSuccess) {
    // Test APIs
    await testManufacturingOrdersAPI();
    await testThemeAPI();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Test Suite Complete!');
    console.log('\n📋 Manual Testing Checklist:');
    console.log('  1. Open http://localhost:3001 in your browser');
    console.log('  2. Login with test@prodease.com / testpass123');
    console.log('  3. Navigate to Manufacturing Orders');
    console.log('  4. Test inline editing by clicking on any field');
    console.log('  5. Test theme toggle in the header');
    console.log('  6. Check real-time status indicator');
    console.log('  7. Verify data updates reflect immediately');
    console.log('\n✨ Expected Results:');
    console.log('  ✅ All edits should update immediately');
    console.log('  ✅ Theme toggle should work smoothly');
    console.log('  ✅ Real-time indicator should show "Live" status');
    console.log('  ✅ No console errors in browser dev tools');
  } else {
    console.log('\n❌ Cannot proceed with API tests due to authentication failure');
  }
}

// Run the test suite
runAllTests().catch(console.error);
